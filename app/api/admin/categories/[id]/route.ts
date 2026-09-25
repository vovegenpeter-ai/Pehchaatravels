import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { categorySchema, formatZodError } from '@/lib/validations'
import { deleteCloudinaryImage } from '@/lib/cloudinary'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const category = await prisma.category.findUnique({ where: { id } })
  if (!category) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(category)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = categorySchema.parse(await request.json())
    const newPublicId = data.imagePublicId || null

    const existing = await prisma.category.findUnique({ where: { id } })
    const oldPublicId = existing?.imagePublicId || null

    const category = await prisma.category.update({
      where: { id },
      data: { ...data, imagePublicId: newPublicId },
    })

    /* Replace: delete the old Cloudinary asset once the DB no longer references it. */
    if (oldPublicId && oldPublicId !== newPublicId) {
      await deleteCloudinaryImage(oldPublicId)
    }

    revalidatePath('/')
    revalidatePath('/places')
    if (category.slug) revalidatePath(`/places/${category.slug}`)
    return NextResponse.json(category)
  } catch (error) {
    const message = formatZodError(error, 'Failed to update category')
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const existing = await prisma.category.findUnique({ where: { id } })
  // Idempotent delete: already gone (double-click / repeated request) → success.
  if (!existing) return NextResponse.json({ success: true })
  try {
    await prisma.category.delete({ where: { id } })
  } catch (err) {
    // P2025 = record vanished between the lookup and the delete — treat as success.
    if (!(err && typeof err === 'object' && 'code' in err && err.code === 'P2025')) throw err
  }
  /* Remove the Cloudinary asset after the record is gone. */
  if (existing?.imagePublicId) await deleteCloudinaryImage(existing.imagePublicId)
  revalidatePath('/')
  revalidatePath('/places')
  return NextResponse.json({ success: true })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const category = await prisma.category.update({ where: { id }, data: await request.json() })
  revalidatePath('/')
  revalidatePath('/places')
  if (category.slug) revalidatePath(`/places/${category.slug}`)
  return NextResponse.json(category)
}