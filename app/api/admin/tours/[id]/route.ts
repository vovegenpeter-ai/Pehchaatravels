import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { tourSchema, formatZodError } from '@/lib/validations'
import { mapTour } from '@/lib/mappers'
import { normalizeCloudImage, deleteCloudinaryImages } from '@/lib/cloudinary'

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
    const normalizedImages = images.map(normalizeCloudImage)
    const newBannerPublicId = tourData.bannerImagePublicId || null

    /* Diff old vs new Cloudinary assets so removed/replaced images are cleaned up. */
    const existing = await prisma.tour.findUnique({ where: { id }, include: { images: true } })
    const oldPublicIds = new Set(
      [...(existing?.images ?? []).map((i) => i.publicId).filter(Boolean), existing?.bannerImagePublicId]
        .filter((p): p is string => Boolean(p))
    )
    const newPublicIds = new Set(
      [...normalizedImages.map((i) => i.publicId).filter(Boolean), newBannerPublicId]
        .filter((p): p is string => Boolean(p))
    )
    const removedPublicIds = [...oldPublicIds].filter((p) => !newPublicIds.has(p))

    await prisma.tourImage.deleteMany({ where: { tourId: id } })

    const tour = await prisma.tour.update({
      where: { id },
      data: {
        ...tourData,
        bannerImagePublicId: newBannerPublicId,
        price: tourData.price,
        images: {
          create: normalizedImages.map((img, index) => ({ url: img.url, publicId: img.publicId, order: index })),
        },
      },
      include: { images: true, category: true },
    })

    /* Delete Cloudinary assets that are no longer referenced by this tour. */
    await deleteCloudinaryImages(removedPublicIds)

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
  const existing = await prisma.tour.findUnique({ where: { id }, include: { images: true } })
  // Manual cascade delete for MongoDB (no FK constraints)
  await prisma.tourImage.deleteMany({ where: { tourId: id } })
  await prisma.destinationTour.deleteMany({ where: { tourId: id } })
  await prisma.review.deleteMany({ where: { tourId: id } })
  await prisma.tour.delete({ where: { id } })
  /* Remove Cloudinary assets after the record is gone. */
  await deleteCloudinaryImages([
    ...(existing?.images ?? []).map((i) => i.publicId),
    existing?.bannerImagePublicId,
  ])
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