import type { Tour, Hotel, Destination, Testimonial, TourImage, HotelImage, Category } from '@prisma/client'

export type TourWithRelations = Tour & {
  images?: TourImage[]
  category?: Category | null
}

export type HotelWithRelations = Hotel & {
  images?: HotelImage[]
  category?: Category | null
}

export function mapTour(tour: TourWithRelations) {
  return {
    id: tour.id,
    slug: tour.slug,
    name: tour.name,
    destination: tour.destination,
    location: tour.location,
    days: tour.days,
    duration: tour.duration,
    description: tour.shortDescription,
    shortDescription: tour.shortDescription,
    fullDescription: tour.fullDescription,
    price: Number(tour.price),
    rating: tour.rating,
    image: tour.bannerImage,
    bannerImage: tour.bannerImage,
    images: tour.images?.sort((a, b) => a.order - b.order).map((i) => i.url) ?? [],
    startDate: tour.startDate,
    startTime: tour.startTime,
    endDate: tour.endDate,
    endTime: tour.endTime,
    meetingPoint: tour.meetingPoint,
    itinerary: (tour.itinerary as Array<Record<string, unknown>>) ?? [],
    includedServices: tour.includedServices,
    excludedServices: tour.excludedServices,
    maxGuests: tour.maxGuests,
    published: tour.published,
    featured: tour.featured,
    popular: tour.popular,
    latest: tour.latest,
    categoryId: tour.categoryId,
    category: tour.category,
  }
}

export function mapHotel(hotel: HotelWithRelations) {
  return {
    id: hotel.id,
    slug: hotel.slug,
    name: hotel.name,
    description: hotel.description,
    location: hotel.location,
    address: hotel.address,
    pricePerNight: Number(hotel.pricePerNight),
    rating: hotel.rating,
    contactPhone: hotel.contactPhone,
    contactEmail: hotel.contactEmail,
    checkInTime: hotel.checkInTime,
    checkOutTime: hotel.checkOutTime,
    amenities: hotel.amenities,
    roomTypes: hotel.roomTypes,
    image: hotel.bannerImage,
    bannerImage: hotel.bannerImage,
    images: hotel.images?.sort((a, b) => a.order - b.order).map((i) => i.url) ?? [],
    published: hotel.published,
    featured: hotel.featured,
    categoryId: hotel.categoryId,
    category: hotel.category,
  }
}

export function mapDestination(dest: Destination) {
  return {
    id: dest.id,
    slug: dest.slug,
    name: dest.name,
    description: dest.description,
    location: dest.location,
    image: dest.image,
    published: dest.published,
    featured: dest.featured,
    categoryId: dest.categoryId,
  }
}

export function mapTestimonial(t: Testimonial) {
  return {
    id: t.id,
    name: t.name,
    text: t.text,
    rating: t.rating,
    avatar: t.avatar,
    published: t.published,
    featured: t.featured,
  }
}
