import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hotelSchema, formatZodError } from '@/lib/validations'
import { mapHotel } from '@/lib/mappers'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const hotel = await prisma.hotel.findUnique({
    where: { id },
    include: { images: true, category: true },
  })
  if (!hotel) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(mapHotel(hotel))
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const data = hotelSchema.parse(body)
    const { images, ...hotelData } = data

    await prisma.hotelImage.deleteMany({ where: { hotelId: id } })

    const hotel = await prisma.hotel.update({
      where: { id },
      data: {
        ...hotelData,
        pricePerNight: hotelData.pricePerNight,
        contactEmail: hotelData.contactEmail || null,
        images: { create: images.map((url, index) => ({ url, order: index })) },
      },
      include: { images: true, category: true },
    })

    return NextResponse.json(mapHotel(hotel))
  } catch (error) {
    const message = formatZodError(error, 'Failed to update hotel')
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.hotel.delete({ where: { id } })
  return NextResponse.json({ success: true })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const hotel = await prisma.hotel.update({
    where: { id },
    data: body,
    include: { images: true, category: true },
  })
  return NextResponse.json(mapHotel(hotel))
}
