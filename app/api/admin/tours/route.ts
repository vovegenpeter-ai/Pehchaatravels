import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { tourSchema, formatZodError } from '@/lib/validations'
import { mapTour } from '@/lib/mappers'
import { normalizeCloudImage } from '@/lib/cloudinary'

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
    const normalizedImages = images.map(normalizeCloudImage)

    const tour = await prisma.tour.create({
      data: {
        ...tourData,
        bannerImagePublicId: tourData.bannerImagePublicId || null,
        price: tourData.price,
        images: {
          create: normalizedImages.map((img, index) => ({ url: img.url, publicId: img.publicId, order: index })),
        },
      },
      include: { images: true, category: true },
    })

    revalidatePath('/')
    revalidatePath('/tours')
    return NextResponse.json(mapTour(tour), { status: 201 })
  } catch (error) {
    const message = formatZodError(error, 'Failed to create tour')
    return NextResponse.json({ error: message }, { status: 400 })
  }
}