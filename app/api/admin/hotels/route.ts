import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hotelSchema, formatZodError } from '@/lib/validations'
import { mapHotel } from '@/lib/mappers'

export async function GET() {
  // Plain list query (no relation includes): the local dev database (Prisma
  // PGlite) is unstable under concurrent relation queries.
  const hotels = await prisma.hotel.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(hotels.map(mapHotel))
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = hotelSchema.parse(body)
    const { images, ...hotelData } = data

    const description = hotelData.fullDescription || hotelData.description || hotelData.shortDescription || ''
    const shortDescription = hotelData.shortDescription || hotelData.description || ''
    const fullDescription = hotelData.fullDescription || hotelData.description || ''

    const hotel = await prisma.hotel.create({
      data: {
        ...hotelData,
        description,
        shortDescription,
        fullDescription,
        pricePerNight: hotelData.pricePerNight,
        contactEmail: hotelData.contactEmail || null,
        images: {
          create: images.map((url, index) => ({ url, order: index })),
        },
      },
      include: { images: true, category: true },
    })

    return NextResponse.json(mapHotel(hotel), { status: 201 })
  } catch (error) {
    const message = formatZodError(error, 'Failed to create hotel')
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
