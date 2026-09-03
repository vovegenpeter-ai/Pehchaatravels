import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { tourSchema, formatZodError } from '@/lib/validations'
import { mapTour } from '@/lib/mappers'

export async function GET() {
  const tours = await prisma.tour.findMany({
    select: {
      id: true, slug: true, name: true, shortDescription: true,
      price: true, rating: true, published: true, featured: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(tours.map((t) => ({ ...t, price: Number(t.price) })))
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

    Promise.resolve().then(() => { revalidatePath('/'); revalidatePath('/tours') })
    return NextResponse.json(mapTour(tour), { status: 201 })
  } catch (error) {
    const message = formatZodError(error, 'Failed to create tour')
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
