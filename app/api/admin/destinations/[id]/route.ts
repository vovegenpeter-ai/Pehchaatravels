import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { destinationSchema, formatZodError } from '@/lib/validations'
import { mapDestination } from '@/lib/mappers'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const destination = await prisma.destination.findUnique({
    where: { id },
    include: { tours: true, hotels: true },
  })
  if (!destination) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({
    ...mapDestination(destination),
    tourIds: destination.tours.map((t) => t.tourId),
    hotelIds: destination.hotels.map((h) => h.hotelId),
  })
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = destinationSchema.parse(await request.json())
    const { tourIds, hotelIds, ...destData } = data

    await prisma.destinationTour.deleteMany({ where: { destinationId: id } })
    await prisma.destinationHotel.deleteMany({ where: { destinationId: id } })

    const destination = await prisma.destination.update({
      where: { id },
      data: {
        ...destData,
        tours: { create: tourIds.map((tourId) => ({ tourId })) },
        hotels: { create: hotelIds.map((hotelId) => ({ hotelId })) },
      },
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
  return NextResponse.json({ success: true })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const destination = await prisma.destination.update({ where: { id }, data: await request.json() })
  return NextResponse.json(mapDestination(destination))
}
