import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { categorySchema, formatZodError } from '@/lib/validations'

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
    const category = await prisma.category.update({ where: { id }, data })
    Promise.resolve().then(() => {
      revalidatePath('/')
      revalidatePath('/places')
      if (category.slug) revalidatePath(`/places/${category.slug}`)
    })
    return NextResponse.json(category)
  } catch (error) {
    const message = formatZodError(error, 'Failed to update category')
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.category.delete({ where: { id } })
  Promise.resolve().then(() => { revalidatePath('/'); revalidatePath('/places') })
  return NextResponse.json({ success: true })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const category = await prisma.category.update({ where: { id }, data: await request.json() })
  Promise.resolve().then(() => {
    revalidatePath('/')
    revalidatePath('/places')
    if (category.slug) revalidatePath(`/places/${category.slug}`)
  })
  return NextResponse.json(category)
}
