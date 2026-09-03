import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { destinationSchema, formatZodError } from '@/lib/validations'
import { mapDestination } from '@/lib/mappers'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const destination = await prisma.destination.findUnique({
    where: { id },
  })
  if (!destination) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(mapDestination(destination))
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = destinationSchema.parse(await request.json())
    const { tourIds, hotelIds, ...destData } = data

    const description = destData.fullDescription || destData.description || destData.shortDescription || ''
    const shortDescription = destData.shortDescription || destData.description || ''
    const fullDescription = destData.fullDescription || destData.description || ''

    const destination = await prisma.destination.update({
      where: { id },
      data: {
        ...destData,
        description,
        shortDescription,
        fullDescription,
      },
    })

    Promise.resolve().then(() => {
      revalidatePath('/')
      revalidatePath('/places')
      if (destination.slug) revalidatePath(`/destinations/${destination.slug}`)
    })
    return NextResponse.json(mapDestination(destination))
  } catch (error) {
    const message = formatZodError(error, 'Failed to update destination')
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.destination.delete({ where: { id } })
  Promise.resolve().then(() => { revalidatePath('/'); revalidatePath('/places') })
  return NextResponse.json({ success: true })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const destination = await prisma.destination.update({ where: { id }, data: await request.json() })
  Promise.resolve().then(() => {
    revalidatePath('/')
    revalidatePath('/places')
    if (destination.slug) revalidatePath(`/destinations/${destination.slug}`)
  })
  return NextResponse.json(mapDestination(destination))
}
