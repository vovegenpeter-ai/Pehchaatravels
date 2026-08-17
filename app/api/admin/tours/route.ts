import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { tourSchema, formatZodError } from '@/lib/validations'
import { mapTour } from '@/lib/mappers'

export async function GET() {
  // Plain list query (no relation includes): the local dev database (Prisma
  // PGlite) is unstable under concurrent relation queries.
  const tours = await prisma.tour.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(tours.map(mapTour))
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = tourSchema.parse(body)
    const { images, ...tourData } = data

    const tour = await prisma.tour.create({
      data: {
        ...tourData,
        price: tourData.price,
        images: {
          create: images.map((url, index) => ({ url, order: index })),
        },
      },
      include: { images: true, category: true },
    })

    return NextResponse.json(mapTour(tour), { status: 201 })
  } catch (error) {
    const message = formatZodError(error, 'Failed to create tour')
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
