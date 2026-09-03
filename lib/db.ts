import 'server-only'
import { prisma } from '@/lib/prisma'
import { mapTour, mapHotel, mapDestination, mapTestimonial } from '@/lib/mappers'

/* Lightweight select for listing pages — avoids loading base64 images */
const tourListSelect = {
  id: true, slug: true, name: true, destination: true, location: true,
  shortDescription: true, fullDescription: true,
  price: true, rating: true, bannerImage: true,
  startDate: true, startTime: true, endDate: true, endTime: true,
  meetingPoint: true, itinerary: true, faqs: true,
  includedServices: true, excludedServices: true, maxGuests: true,
  published: true, featured: true, latest: true, categoryId: true,
  createdAt: true,
}

const hotelListSelect = {
  id: true, slug: true, name: true, shortDescription: true, fullDescription: true,
  location: true, address: true, pricePerNight: true, rating: true,
  contactPhone: true, contactEmail: true,
  checkInTime: true, checkOutTime: true, bannerImage: true,
  amenities: true, roomTypes: true,
  published: true, featured: true, categoryId: true, createdAt: true,
}

export async function getPublishedTours() {
  const tours = await prisma.tour.findMany({
    where: { published: true },
    select: tourListSelect,
    orderBy: { createdAt: 'desc' },
  })
  return tours.map((t) => mapTour(t as any))
}

export async function getFeaturedTours(limit = 6) {
  const tours = await prisma.tour.findMany({
    where: { published: true, featured: true },
    select: tourListSelect,
    take: limit,
    orderBy: { createdAt: 'desc' },
  })
  return tours.map((t) => mapTour(t as any))
}

export async function getRelatedTours(currentId: string, limit = 3) {
  const tours = await prisma.tour.findMany({
    where: { published: true, id: { not: currentId } },
    select: tourListSelect,
    take: limit,
    orderBy: { rating: 'desc' },
  })
  return tours.map((t) => mapTour(t as any))
}

export async function getRelatedHotels(currentId: string, limit = 3) {
  const hotels = await prisma.hotel.findMany({
    where: { published: true, id: { not: currentId } },
    select: hotelListSelect,
    take: limit,
    orderBy: { rating: 'desc' },
  })
  return hotels.map((h) => mapHotel(h as any))
}

export async function getRelatedDestinations(currentId: string, limit = 4, categoryId?: string | null) {
  /* First try to find destinations in the same category */
  if (categoryId) {
    const sameCategory = await prisma.destination.findMany({
      where: { published: true, id: { not: currentId }, categoryId },
      take: limit,
      orderBy: { createdAt: 'desc' },
    })
    if (sameCategory.length >= limit) return sameCategory.map(mapDestination)
    /* Supplement with other destinations if not enough */
    const remaining = limit - sameCategory.length
    const others = await prisma.destination.findMany({
      where: { published: true, id: { not: currentId }, categoryId: { not: categoryId } },
      take: remaining,
      orderBy: { createdAt: 'desc' },
    })
    return [...sameCategory, ...others].map(mapDestination)
  }
  /* No category — return any published destinations */
  const destinations = await prisma.destination.findMany({
    where: { published: true, id: { not: currentId } },
    take: limit,
    orderBy: { createdAt: 'desc' },
  })
  return destinations.map(mapDestination)
}

export async function getLatestTours(limit = 6) {
  const tours = await prisma.tour.findMany({
    where: { published: true, latest: true },
    select: tourListSelect,
    take: limit,
    orderBy: { createdAt: 'desc' },
  })
  return tours.map((t) => mapTour(t as any))
}

export async function getTourBySlugOrId(slugOrId: string) {
  const tour = await prisma.tour.findFirst({
    where: {
      OR: [{ slug: slugOrId }, { id: slugOrId }],
      published: true,
    },
    select: { ...tourListSelect, images: { select: { url: true, order: true } } },
  })
  return tour ? mapTour(tour as any) : null
}

export async function getAllToursAdmin() {
  const tours = await prisma.tour.findMany({
    select: tourListSelect,
    orderBy: { createdAt: 'desc' },
  })
  return tours.map((t) => mapTour(t as any))
}

export async function getPublishedHotels() {
  const hotels = await prisma.hotel.findMany({
    where: { published: true },
    select: hotelListSelect,
    orderBy: { createdAt: 'desc' },
  })
  return hotels.map((h) => mapHotel(h as any))
}

export async function getFeaturedHotels(limit = 6) {
  const hotels = await prisma.hotel.findMany({
    where: { published: true, featured: true },
    select: hotelListSelect,
    take: limit,
    orderBy: { rating: 'desc' },
  })
  return hotels.map((h) => mapHotel(h as any))
}

export async function getHotelBySlugOrId(slugOrId: string) {
  const hotel = await prisma.hotel.findFirst({
    where: {
      OR: [{ slug: slugOrId }, { id: slugOrId }],
      published: true,
    },
    include: { images: true, category: true },
  })
  return hotel ? mapHotel(hotel) : null
}

export async function getPublishedDestinations() {
  const destinations = await prisma.destination.findMany({
    where: { published: true },
    orderBy: { name: 'asc' },
  })
  return destinations.map(mapDestination)
}

/* === Places section: Categories === */

/** All DESTINATION categories with destination counts */
export async function getDestinationCategories() {
  const categories = await prisma.category.findMany({
    where: { published: true },
    include: {
      _count: { select: { destinations: { where: { published: true } } } },
    },
  })
  const mapped = categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    shortDescription: c.shortDescription,
    longDescription: c.longDescription,
    image: c.image,
    orderNumber: c.orderNumber ?? 0,
    destinationCount: c._count.destinations,
    createdAt: c.createdAt,
  }))
  // Sort: custom order (orderNumber > 0) first ascending, then unordered (0) by newest
  mapped.sort((a, b) => {
    const aOrder = a.orderNumber > 0 ? a.orderNumber : Infinity
    const bOrder = b.orderNumber > 0 ? b.orderNumber : Infinity
    if (aOrder !== bOrder) return aOrder - bOrder
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
  return mapped
}

/** Category by slug */
export async function getCategoryBySlug(slug: string) {
  const category = await prisma.category.findFirst({
    where: { slug, published: true },
    include: {
      _count: { select: { destinations: { where: { published: true } } } },
    },
  })
  if (!category) return null
  const destinations = await prisma.destination.findMany({
    where: { published: true, categoryId: category.id },
  })
  // Sort: custom order first, then by newest
  destinations.sort((a, b) => {
    const aOrder = (a.orderNumber ?? 0) > 0 ? a.orderNumber : Infinity
    const bOrder = (b.orderNumber ?? 0) > 0 ? b.orderNumber : Infinity
    if (aOrder !== bOrder) return aOrder - bOrder
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    description: category.description,
    shortDescription: category.shortDescription,
    longDescription: category.longDescription,
    image: category.image,
    orderNumber: category.orderNumber,
    destinationCount: category._count.destinations,
    destinations: destinations.map(mapDestination),
  }
}

/** All destinations under a category */
export async function getDestinationsByCategory(categoryId: string) {
  const destinations = await prisma.destination.findMany({
    where: { published: true, categoryId },
  })
  // Sort: custom order (orderNumber > 0) first ascending, then unordered (0) by newest
  destinations.sort((a, b) => {
    const aOrder = (a.orderNumber ?? 0) > 0 ? a.orderNumber : Infinity
    const bOrder = (b.orderNumber ?? 0) > 0 ? b.orderNumber : Infinity
    if (aOrder !== bOrder) return aOrder - bOrder
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
  return destinations.map(mapDestination)
}

export async function getFeaturedDestinations(limit = 8) {
  const destinations = await prisma.destination.findMany({
    where: { published: true, featured: true },
    take: limit,
    orderBy: { name: 'asc' },
  })
  return destinations.map(mapDestination)
}

export async function getDestinationBySlug(slug: string) {
  const destination = await prisma.destination.findFirst({
    where: { OR: [{ slug }, { id: slug }], published: true },
  })
  if (!destination) return null

  /* Fetch related tours/hotels WITHOUT images (cards only need bannerImage) */
  const tourLinks = await prisma.destinationTour.findMany({
    where: { destinationId: destination.id },
    include: { tour: { select: tourListSelect } },
  })
  const hotelLinks = await prisma.destinationHotel.findMany({
    where: { destinationId: destination.id },
    include: { hotel: { select: hotelListSelect } },
  })

  return {
    ...mapDestination(destination),
    tours: tourLinks.map((dt) => mapTour(dt.tour as any)).filter((t) => t.published),
    hotels: hotelLinks.map((dh) => mapHotel(dh.hotel as any)).filter((h) => h.published),
  }
}

export async function getPublishedCategories(type?: string) {
  const categories = await prisma.category.findMany({
    where: { published: true, ...(type ? { type: type as never } : {}) },
  })
  // Sort: custom order (orderNumber > 0) first ascending, then unordered (0) by newest
  categories.sort((a, b) => {
    const aOrder = (a.orderNumber ?? 0) > 0 ? a.orderNumber : Infinity
    const bOrder = (b.orderNumber ?? 0) > 0 ? b.orderNumber : Infinity
    if (aOrder !== bOrder) return aOrder - bOrder
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
  return categories
}

export async function getFeaturedTestimonials(limit = 6) {
  const items = await prisma.testimonial.findMany({
    where: { published: true, featured: true },
    take: limit,
    orderBy: { createdAt: 'desc' },
  })
  return items.map(mapTestimonial)
}

// Backward-compatible aliases for existing pages
export const getTours = getPublishedTours
export const getHotels = getPublishedHotels

export async function addContactMessage(data: {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}) {
  return prisma.contactMessage.create({ data })
}

export async function addTripRequest(data: {
  name: string
  email: string
  phone: string
  destination: string
  travelers: number
  startDate: string
  endDate: string
  budget?: string
  message?: string
}) {
  return prisma.tripRequest.create({
    data: {
      ...data,
      travelers: Number(data.travelers),
    },
  })
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

export async function getUserByPhone(phone: string) {
  return prisma.user.findUnique({ where: { phone } })
}

export async function createUser(data: {
  fullName: string
  email: string
  phone: string
  passwordHash: string
}) {
  return prisma.user.create({ data })
}
