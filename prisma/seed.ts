import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import 'dotenv/config'
import { defaultTours, defaultHotels, popularPlaces, reviews } from '../lib/initialData.js'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 10)
  await prisma.admin.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@pehchaantravels.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@pehchaantravels.com',
      passwordHash,
      name: process.env.ADMIN_NAME || 'Pehchaan Admin',
    },
  })

  const tourCategory = await prisma.category.upsert({
    where: { slug: 'northern-pakistan-tours' },
    update: {},
    create: {
      name: 'Northern Pakistan Tours',
      slug: 'northern-pakistan-tours',
      type: 'TOUR',
      description: 'Adventures across Hunza, Skardu, Naran and beyond',
    },
  })

  const hotelCategory = await prisma.category.upsert({
    where: { slug: 'mountain-hotels' },
    update: {},
    create: {
      name: 'Mountain Hotels',
      slug: 'mountain-hotels',
      type: 'HOTEL',
      description: 'Handpicked stays in Northern Pakistan',
    },
  })

  const destCategory = await prisma.category.upsert({
    where: { slug: 'popular-destinations' },
    update: {},
    create: {
      name: 'Popular Destinations',
      slug: 'popular-destinations',
      type: 'DESTINATION',
      description: 'Top places to explore in Pakistan',
    },
  })

  for (const [index, tour] of defaultTours.entries()) {
    await prisma.tour.upsert({
      where: { slug: tour.slug },
      update: {},
      create: {
        slug: tour.slug,
        name: tour.name,
        shortDescription: tour.description,
        fullDescription: tour.fullDescription || tour.description,
        destination: tour.destination,
        location: tour.destination,
        price: tour.price,
        duration: tour.duration || `${tour.days} Days`,
        days: tour.days,
        startDate: tour.startDate,
        startTime: tour.startTime,
        endDate: tour.endDate,
        endTime: tour.endTime,
        meetingPoint: tour.meetingPoint,
        itinerary: tour.itinerary ?? [],
        includedServices: tour.highlights ?? [],
        excludedServices: ['Personal expenses', 'Travel insurance', 'Tips'],
        maxGuests: 20,
        rating: tour.rating,
        bannerImage: tour.image,
        published: true,
        featured: index < 3,
        popular: index < 4,
        latest: index >= 2,
        categoryId: tourCategory.id,
        images: {
          create: [{ url: tour.image, alt: tour.name, order: 0 }],
        },
      },
    })
  }

  for (const [index, hotel] of defaultHotels.entries()) {
    const slug = hotel.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    await prisma.hotel.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        name: hotel.name,
        description: hotel.description,
        location: hotel.location,
        address: hotel.location,
        pricePerNight: hotel.pricePerNight,
        rating: hotel.rating,
        checkInTime: '2:00 PM',
        checkOutTime: '12:00 PM',
        amenities: ['WiFi', 'Parking', 'Restaurant', 'Room Service'],
        roomTypes: [{ name: 'Standard', price: hotel.pricePerNight, description: 'Comfortable room with mountain views' }],
        bannerImage: hotel.image,
        published: true,
        featured: index < 3,
        categoryId: hotelCategory.id,
        images: {
          create: [{ url: hotel.image, alt: hotel.name, order: 0 }],
        },
      },
    })
  }

  for (const place of popularPlaces) {
    await prisma.destination.upsert({
      where: { slug: place.id },
      update: {},
      create: {
        slug: place.id,
        name: place.name,
        description: place.description,
        location: place.name,
        image: place.image,
        published: true,
        featured: true,
        categoryId: destCategory.id,
      },
    })
  }

  for (const review of reviews) {
    await prisma.testimonial.upsert({
      where: { id: review.id },
      update: {},
      create: {
        id: review.id,
        name: review.name,
        text: review.text,
        rating: review.rating,
        avatar: review.avatar,
        published: true,
        featured: true,
      },
    })
  }

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
