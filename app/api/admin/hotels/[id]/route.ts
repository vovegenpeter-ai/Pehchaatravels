import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { hotelSchema, formatZodError } from '@/lib/validations'
import { mapHotel } from '@/lib/mappers'
import { normalizeCloudImage, deleteCloudinaryImages } from '@/lib/cloudinary'

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
    const normalizedImages = images.map(normalizeCloudImage)
    const newBannerPublicId = hotelData.bannerImagePublicId || null

    /* Diff old vs new Cloudinary assets so removed/replaced images are cleaned up. */
    const existing = await prisma.hotel.findUnique({ where: { id }, include: { images: true } })
    const oldPublicIds = new Set(
      [...(existing?.images ?? []).map((i) => i.publicId).filter(Boolean), existing?.bannerImagePublicId]
        .filter((p): p is string => Boolean(p))
    )
    const newPublicIds = new Set(
      [...normalizedImages.map((i) => i.publicId).filter(Boolean), newBannerPublicId]
        .filter((p): p is string => Boolean(p))
    )
    const removedPublicIds = [...oldPublicIds].filter((p) => !newPublicIds.has(p))

    await prisma.hotelImage.deleteMany({ where: { hotelId: id } })

    const description = hotelData.fullDescription || hotelData.description || hotelData.shortDescription || ''
    const shortDescription = hotelData.shortDescription || hotelData.description || ''
    const fullDescription = hotelData.fullDescription || hotelData.description || ''

    const hotel = await prisma.hotel.update({
      where: { id },
      data: {
        ...hotelData,
        description,
        shortDescription,
        fullDescription,
        bannerImagePublicId: newBannerPublicId,
        pricePerNight: hotelData.pricePerNight,
        contactEmail: hotelData.contactEmail || null,
        images: {
          create: normalizedImages.map((img, index) => ({ url: img.url, publicId: img.publicId, order: index })),
        },
      },
      include: { images: true, category: true },
    })

    /* Delete Cloudinary assets that are no longer referenced by this hotel. */
    await deleteCloudinaryImages(removedPublicIds)

    revalidatePath('/')
    revalidatePath('/hotels')
    if (hotel.slug) revalidatePath(`/hotels/${hotel.slug}`)
    return NextResponse.json(mapHotel(hotel))
  } catch (error) {
    const message = formatZodError(error, 'Failed to update hotel')
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const existing = await prisma.hotel.findUnique({ where: { id }, include: { images: true } })
  // Manual cascade delete for MongoDB
  await prisma.hotelImage.deleteMany({ where: { hotelId: id } })
  await prisma.destinationHotel.deleteMany({ where: { hotelId: id } })
  await prisma.hotel.delete({ where: { id } })
  /* Remove Cloudinary assets after the record is gone. */
  await deleteCloudinaryImages([
    ...(existing?.images ?? []).map((i) => i.publicId),
    existing?.bannerImagePublicId,
  ])
  revalidatePath('/')
  revalidatePath('/hotels')
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
  revalidatePath('/')
  revalidatePath('/hotels')
  if (hotel.slug) revalidatePath(`/hotels/${hotel.slug}`)
  return NextResponse.json(mapHotel(hotel))
}