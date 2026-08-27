import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { destinationSchema, formatZodError } from '@/lib/validations'
import { mapDestination } from '@/lib/mappers'

export async function GET() {
  const destinations = await prisma.destination.findMany({
    include: { tours: true, hotels: true },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(destinations.map((d) => ({
    ...mapDestination(d),
    tourIds: d.tours.map((t) => t.tourId),
    hotelIds: d.hotels.map((h) => h.hotelId),
  })))
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = destinationSchema.parse(body)
    const { tourIds, hotelIds, ...destData } = data

    const description = destData.fullDescription || destData.description || destData.shortDescription || ''
    const shortDescription = destData.shortDescription || destData.description || ''
    const fullDescription = destData.fullDescription || destData.description || ''

    const destination = await prisma.destination.create({
      data: {
        ...destData,
        description,
        shortDescription,
        fullDescription,
        tours: { create: tourIds.map((tourId) => ({ tourId })) },
        hotels: { create: hotelIds.map((hotelId) => ({ hotelId })) },
      },
    })

    return NextResponse.json(mapDestination(destination), { status: 201 })
  } catch (error) {
    const message = formatZodError(error, 'Failed to create destination')
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
