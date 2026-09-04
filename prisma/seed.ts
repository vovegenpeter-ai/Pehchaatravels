import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'
import { defaultTours, defaultHotels, popularPlaces, reviews } from '../lib/initialData.js'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding MongoDB database...')

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

  /* Main destination categories for the Places section */
  const kashmir = await prisma.category.upsert({
    where: { slug: 'kashmir' },
    update: {},
    create: {
      name: 'Kashmir',
      slug: 'kashmir',
      type: 'DESTINATION',
      description: 'Paradise on Earth — lush valleys, pristine lakes, and breathtaking mountain landscapes',
    },
  })

  const kpk = await prisma.category.upsert({
    where: { slug: 'khyber-pakhtunkhwa' },
    update: {},
    create: {
      name: 'Khyber Pakhtunkhwa',
      slug: 'khyber-pakhtunkhwa',
      type: 'DESTINATION',
      description: 'Land of hospitality — from Swat Valley to the majestic Hindu Kush range',
    },
  })

  const gilgitBaltistan = await prisma.category.upsert({
    where: { slug: 'gilgit-baltistan' },
    update: {},
    create: {
      name: 'Gilgit-Baltistan',
      slug: 'gilgit-baltistan',
      type: 'DESTINATION',
      description: 'Roof of the World — home to K2, Deosai, and the legendary Karakoram Highway',
    },
  })

  /* Keep the old Popular Destinations as a fallback */
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

  /* Create subcategories for Kashmir */
  const neelumValley = await prisma.category.upsert({
    where: { slug: 'neelum-valley' },
    update: {},
    create: {
      name: 'Neelum Valley',
      slug: 'neelum-valley',
      type: 'DESTINATION',
      description: 'A lush green valley with turquoise rivers and picturesque villages',
    },
  })

  const leepaValley = await prisma.category.upsert({
    where: { slug: 'leepa-valley' },
    update: {},
    create: {
      name: 'Leepa Valley',
      slug: 'leepa-valley',
      type: 'DESTINATION',
      description: 'Hidden gem with terraced fields and traditional wooden houses',
    },
  })

  const muzaffarabad = await prisma.category.upsert({
    where: { slug: 'muzaffarabad' },
    update: {},
    create: {
      name: 'Muzaffarabad',
      slug: 'muzaffarabad',
      type: 'DESTINATION',
      description: 'Capital of Azad Kashmir at the confluence of two rivers',
    },
  })

  /* Create subcategories for KPK */
  const swat = await prisma.category.upsert({
    where: { slug: 'swat' },
    update: {},
    create: {
      name: 'Swat Valley',
      slug: 'swat',
      type: 'DESTINATION',
      description: 'The Switzerland of Pakistan — alpine meadows and crystal-clear lakes',
    },
  })

  const chitral = await prisma.category.upsert({
    where: { slug: 'chitral' },
    update: {},
    create: {
      name: 'Chitral',
      slug: 'chitral',
      type: 'DESTINATION',
      description: 'Remote valleys, Kalash culture, and the stunning Tirich Mir peak',
    },
  })

  /* Create subcategories for Gilgit-Baltistan */
  const hunza = await prisma.category.upsert({
    where: { slug: 'hunza' },
    update: {},
    create: {
      name: 'Hunza Valley',
      slug: 'hunza',
      type: 'DESTINATION',
      description: 'Fairy-tale valley with ancient forts, turquoise lakes, and warm hospitality',
    },
  })

  const skardu = await prisma.category.upsert({
    where: { slug: 'skardu' },
    update: {},
    create: {
      name: 'Skardu',
      slug: 'skardu',
      type: 'DESTINATION',
      description: 'Gateway to K2 — cold desert, Shangrila Resort, and mighty Karakoram peaks',
    },
  })

  const deosai = await prisma.category.upsert({
    where: { slug: 'deosai' },
    update: {},
    create: {
      name: 'Deosai Plains',
      slug: 'deosai',
      type: 'DESTINATION',
      description: 'Second highest plateau in the world — wildflowers, marmots, and golden bears',
    },
  })

  for (const [index, tour] of defaultTours.entries()) {
    // Create tour without nested image creation — handle images separately for MongoDB
    const existingTour = await prisma.tour.findUnique({ where: { slug: tour.slug } })
    if (!existingTour) {
      const createdTour = await prisma.tour.create({
        data: {
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
          latest: index >= 2,
          categoryId: tourCategory.id,
        },
      })
      await prisma.tourImage.create({
        data: { url: tour.image, alt: tour.name, order: 0, tourId: createdTour.id },
      })
    }
  }

  for (const [index, hotel] of defaultHotels.entries()) {
    const slug = hotel.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const existingHotel = await prisma.hotel.findUnique({ where: { slug } })
    if (!existingHotel) {
      const createdHotel = await prisma.hotel.create({
        data: {
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
        },
      })
      await prisma.hotelImage.create({
        data: { url: hotel.image, alt: hotel.name, order: 0, hotelId: createdHotel.id },
      })
    }
  }

  /* Map destinations to appropriate categories */
  const categoryMap: Record<string, string> = {
    'kashmir': kashmir.id,
    'kpk': kpk.id,
    'gilgit-baltistan': gilgitBaltistan.id,
    'hunza': hunza.id,
    'skardu': skardu.id,
    'swat': swat.id,
    'neelum': neelumValley.id,
    'fairy-meadows': gilgitBaltistan.id,
  }

  for (const place of popularPlaces) {
    /* Try to match destination to a specific category, fallback to Popular */
    const placeKey = place.id.toLowerCase()
    let categoryId = destCategory.id
    for (const [key, catId] of Object.entries(categoryMap)) {
      if (placeKey.includes(key)) {
        categoryId = catId
        break
      }
    }

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
        categoryId,
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
  })
