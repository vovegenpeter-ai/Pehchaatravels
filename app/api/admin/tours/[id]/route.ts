import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { tourSchema, formatZodError } from '@/lib/validations'
import { mapTour } from '@/lib/mappers'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tour = await prisma.tour.findUnique({
    where: { id },
    include: { images: true, category: true },
  })
  if (!tour) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(mapTour(tour))
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const data = tourSchema.parse(body)
    const { images, ...tourData } = data

    await prisma.tourImage.deleteMany({ where: { tourId: id } })

    const tour = await prisma.tour.update({
      where: { id },
      data: {
        ...tourData,
        price: tourData.price,
        images: {
          create: images.map((url, index) => ({ url, order: index })),
        },
      },
      include: { images: true, category: true },
    })

    revalidatePath('/')
    revalidatePath('/tours')
    if (tour.slug) revalidatePath(`/tours/${tour.slug}`)
    return NextResponse.json(mapTour(tour))
  } catch (error) {
    const message = formatZodError(error, 'Failed to update tour')
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // Manual cascade delete for MongoDB (no FK constraints)
  await prisma.tourImage.deleteMany({ where: { tourId: id } })
  await prisma.destinationTour.deleteMany({ where: { tourId: id } })
  await prisma.review.deleteMany({ where: { tourId: id } })
  await prisma.tour.delete({ where: { id } })
  revalidatePath('/')
  revalidatePath('/tours')
  return NextResponse.json({ success: true })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const tour = await prisma.tour.update({
    where: { id },
    data: body,
    include: { images: true, category: true },
  })
  revalidatePath('/')
  revalidatePath('/tours')
  if (tour.slug) revalidatePath(`/tours/${tour.slug}`)
  return NextResponse.json(mapTour(tour))
}
