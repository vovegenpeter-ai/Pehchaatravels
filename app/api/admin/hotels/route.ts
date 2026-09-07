import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { hotelSchema, formatZodError } from '@/lib/validations'
import { mapHotel } from '@/lib/mappers'
import { normalizeCloudImage } from '@/lib/cloudinary'

export async function GET() {
  const hotels = await prisma.hotel.findMany({
    select: {
      id: true, slug: true, name: true, shortDescription: true,
      location: true, pricePerNight: true, rating: true,
      published: true, featured: true, createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(hotels.map((h) => ({ ...h, pricePerNight: Number(h.pricePerNight) })))
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = hotelSchema.parse(body)
    const { images, ...hotelData } = data
    const normalizedImages = images.map(normalizeCloudImage)

    const description = hotelData.fullDescription || hotelData.description || hotelData.shortDescription || ''
    const shortDescription = hotelData.shortDescription || hotelData.description || ''
    const fullDescription = hotelData.fullDescription || hotelData.description || ''

    const hotel = await prisma.hotel.create({
      data: {
        ...hotelData,
        description,
        shortDescription,
        fullDescription,
        bannerImagePublicId: hotelData.bannerImagePublicId || null,
        pricePerNight: hotelData.pricePerNight,
        contactEmail: hotelData.contactEmail || null,
        images: {
          create: normalizedImages.map((img, index) => ({ url: img.url, publicId: img.publicId, order: index })),
        },
      },
      include: { images: true, category: true },
    })

    revalidatePath('/')
    revalidatePath('/hotels')
    return NextResponse.json(mapHotel(hotel), { status: 201 })
  } catch (error) {
    const message = formatZodError(error, 'Failed to create hotel')
    return NextResponse.json({ error: message }, { status: 400 })
  }
}