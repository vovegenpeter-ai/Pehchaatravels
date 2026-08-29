import 'server-only'
import { prisma } from '@/lib/prisma'
import { mapTour, mapHotel, mapDestination, mapTestimonial } from '@/lib/mappers'

const tourInclude = { images: true, category: true }

export async function getPublishedTours() {
  const tours = await prisma.tour.findMany({
    where: { published: true },
    include: tourInclude,
    orderBy: { createdAt: 'desc' },
  })
  return tours.map(mapTour)
}

export async function getFeaturedTours(limit = 6) {
  const tours = await prisma.tour.findMany({
    where: { published: true, featured: true },
    include: tourInclude,
    take: limit,
    orderBy: { createdAt: 'desc' },
  })
  return tours.map(mapTour)
}

export async function getRelatedTours(currentId: string, limit = 3) {
  const tours = await prisma.tour.findMany({
    where: { published: true, id: { not: currentId } },
    include: tourInclude,
    take: limit,
    orderBy: { rating: 'desc' },
  })
  return tours.map(mapTour)
}

export async function getRelatedHotels(currentId: string, limit = 3) {
  const hotels = await prisma.hotel.findMany({
    where: { published: true, id: { not: currentId } },
    include: { images: true, category: true },
    take: limit,
    orderBy: { rating: 'desc' },
  })
  return hotels.map(mapHotel)
}

export async function getRelatedDestinations(currentId: string, limit = 4) {
  const destinations = await prisma.destination.findMany({
    where: { published: true, id: { not: currentId } },
    take: limit,
    orderBy: { name: 'asc' },
  })
  return destinations.map(mapDestination)
}

export async function getLatestTours(limit = 6) {
  const tours = await prisma.tour.findMany({
    where: { published: true, latest: true },
    include: tourInclude,
    take: limit,
    orderBy: { createdAt: 'desc' },
  })
  return tours.map(mapTour)
}

export async function getTourBySlugOrId(slugOrId: string) {
  const tour = await prisma.tour.findFirst({
    where: {
      OR: [{ slug: slugOrId }, { id: slugOrId }],
      published: true,
    },
    include: tourInclude,
  })
  return tour ? mapTour(tour) : null
}

export async function getAllToursAdmin() {
  const tours = await prisma.tour.findMany({
    include: tourInclude,
    orderBy: { createdAt: 'desc' },
  })
  return tours.map(mapTour)
}

export async function getPublishedHotels() {
  const hotels = await prisma.hotel.findMany({
    where: { published: true },
    include: { images: true, category: true },
    orderBy: { createdAt: 'desc' },
  })
  return hotels.map(mapHotel)
}

export async function getFeaturedHotels(limit = 6) {
  const hotels = await prisma.hotel.findMany({
    where: { published: true, featured: true },
    include: { images: true, category: true },
    take: limit,
    orderBy: { rating: 'desc' },
  })
  return hotels.map(mapHotel)
}

export async function getHotelBySlugOrId(slugOrId: string) {
  const hotel = await prisma.hotel.findFirst({
    where: {
      OR: [{ slug: slugOrId }, { id: slugOrId }],
      published: true,
    },
    include: { images: true, category: true, destinations: { include: { destination: true } } },
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

/* === Places section: Category hierarchy === */

/** Top-level DESTINATION categories with children and destination counts */
export async function getDestinationCategories() {
  const categories = await prisma.category.findMany({
    where: { type: 'DESTINATION', parentId: null, published: true },
    orderBy: { name: 'asc' },
    include: {
      children: {
        where: { published: true },
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { destinations: { where: { published: true } } } },
        },
      },
      _count: { select: { destinations: { where: { published: true } } } },
    },
  })
  return categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    destinationCount: c._count.destinations + c.children.reduce((sum, ch) => sum + ch._count.destinations, 0),
    children: c.children.map((ch) => ({
      id: ch.id,
      slug: ch.slug,
      name: ch.name,
      description: ch.description,
      destinationCount: ch._count.destinations,
    })),
  }))
}

/** Category by slug (with children) */
export async function getCategoryBySlug(slug: string) {
  const category = await prisma.category.findFirst({
    where: { slug, type: 'DESTINATION', published: true },
    include: {
      children: {
        where: { published: true },
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { destinations: { where: { published: true } } } },
        },
      },
      _count: { select: { destinations: { where: { published: true } } } },
    },
  })
  if (!category) return null
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    description: category.description,
    destinationCount: category._count.destinations + category.children.reduce((sum, ch) => sum + ch._count.destinations, 0),
    children: category.children.map((ch) => ({
      id: ch.id,
      slug: ch.slug,
      name: ch.name,
      description: ch.description,
      destinationCount: ch._count.destinations,
    })),
  }
}

/** All destinations under a category (including its subcategories) */
export async function getDestinationsByCategory(categoryId: string) {
  /* Get the category and its children */
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { children: { select: { id: true } } },
  })
  if (!category) return []

  const categoryIds = [categoryId, ...category.children.map((c) => c.id)]
  const destinations = await prisma.destination.findMany({
    where: { published: true, categoryId: { in: categoryIds } },
    orderBy: { name: 'asc' },
  })
  return destinations.map(mapDestination)
}

/** All destinations under a subcategory */
export async function getDestinationsBySubcategory(subcategoryId: string) {
  const destinations = await prisma.destination.findMany({
    where: { published: true, categoryId: subcategoryId },
    orderBy: { name: 'asc' },
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
  // Fetched in separate sequential queries: the local dev database (Prisma
  // PGlite) crashes on deep nested includes, so we avoid them here.
  const destination = await prisma.destination.findFirst({
    where: { OR: [{ slug }, { id: slug }], published: true },
  })
  if (!destination) return null

  const tourLinks = await prisma.destinationTour.findMany({
    where: { destinationId: destination.id },
    include: { tour: { include: tourInclude } },
  })
  const hotelLinks = await prisma.destinationHotel.findMany({
    where: { destinationId: destination.id },
    include: { hotel: { include: { images: true, category: true } } },
  })

  return {
    ...mapDestination(destination),
    tours: tourLinks.map((dt) => mapTour(dt.tour)).filter((t) => t.published),
    hotels: hotelLinks.map((dh) => mapHotel(dh.hotel)).filter((h) => h.published),
  }
}

export async function getPublishedCategories(type?: string) {
  return prisma.category.findMany({
    where: { published: true, ...(type ? { type: type as never } : {}) },
    orderBy: { name: 'asc' },
  })
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
