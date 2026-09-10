/**
 * Import script: Neon PostgreSQL JSON export → MongoDB
 *
 * Reads migration-data/neon-export.json and inserts into MongoDB via Prisma.
 *
 * Run: npx tsx prisma/import-from-json.ts
 */
import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

function toDate(val: unknown): Date {
  if (!val) return new Date()
  if (val instanceof Date) return val
  if (typeof val === 'string') return new Date(val)
  return new Date()
}

function toNum(val: unknown): number {
  if (val === null || val === undefined) return 0
  return Number(val)
}

function toJSON(val: unknown): any {
  if (val === null || val === undefined) return null
  if (typeof val === 'string') {
    try { return JSON.parse(val) } catch { return null }
  }
  return val
}

function toArray(val: unknown): string[] {
  if (!val) return []
  if (Array.isArray(val)) return val.map(String)
  if (typeof val === 'string') {
    // PostgreSQL array: {item1,item2} or {"item1","item2"}
    const cleaned = val.replace(/^{/, '').replace(/}$/, '')
    if (!cleaned) return []
    // Handle quoted items
    const items: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < cleaned.length; i++) {
      const ch = cleaned[i]
      if (ch === '"') { inQuotes = !inQuotes; continue }
      if (ch === ',' && !inQuotes) { items.push(current.trim()); current = ''; continue }
      current += ch
    }
    if (current.trim()) items.push(current.trim())
    return items
  }
  return []
}

function str(val: unknown): string | null {
  if (val === null || val === undefined) return null
  return String(val)
}

async function main() {
  console.log('🚀 Importing data from Neon export into MongoDB...\n')

  const filePath = join(process.cwd(), 'migration-data', 'neon-export.json')
  const rawData = readFileSync(filePath, 'utf-8')
  const data = JSON.parse(rawData)

  // ============================================================
  // 1. ADMINS
  // ============================================================
  if (data.admins?.length) {
    for (const a of data.admins) {
      await prisma.admin.upsert({
        where: { id: a.id },
        update: {},
        create: {
          id: a.id,
          email: a.email,
          passwordHash: a.passwordHash,
          name: a.name,
          createdAt: toDate(a.createdAt),
          updatedAt: toDate(a.updatedAt),
        },
      })
    }
    console.log(`✅ ${data.admins.length} admins`)
  }

  // ============================================================
  // 2. ADMIN PASSWORD RESET TOKENS
  // ============================================================
  if (data.adminTokens?.length) {
    for (const t of data.adminTokens) {
      try {
        await prisma.passwordResetToken.upsert({
          where: { id: t.id },
          update: {},
          create: {
            id: t.id,
            token: t.token,
            adminId: t.adminId,
            expiresAt: toDate(t.expiresAt),
            used: t.used,
            createdAt: toDate(t.createdAt),
          },
        })
      } catch (e: any) {
        // Skip if admin doesn't exist in MongoDB
        console.log(`   ⚠️ Skipped admin token ${t.id}: ${e.message?.slice(0, 80)}`)
      }
    }
    console.log(`✅ ${data.adminTokens.length} admin tokens`)
  }

  // ============================================================
  // 3. CATEGORIES
  // ============================================================
  if (data.categories?.length) {
    for (const c of data.categories) {
      await prisma.category.upsert({
        where: { id: c.id },
        update: {},
        create: {
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: str(c.description),
          shortDescription: str(c.shortDescription),
          longDescription: str(c.longDescription),
          type: c.type,
          published: c.published,
          image: str(c.image),
          orderNumber: c.orderNumber ?? 0,
          createdAt: toDate(c.createdAt),
          updatedAt: toDate(c.updatedAt),
        },
      })
    }
    console.log(`✅ ${data.categories.length} categories`)
  }

  // ============================================================
  // 4. TOURS
  // ============================================================
  if (data.tours?.length) {
    for (const t of data.tours) {
      await prisma.tour.upsert({
        where: { id: t.id },
        update: {},
        create: {
          id: t.id,
          slug: t.slug,
          name: t.name,
          shortDescription: t.shortDescription,
          fullDescription: t.fullDescription,
          destination: t.destination,
          location: str(t.location),
          price: toNum(t.price),
          duration: t.duration,
          days: t.days,
          startDate: str(t.startDate),
          startTime: str(t.startTime),
          endDate: str(t.endDate),
          endTime: str(t.endTime),
          meetingPoint: str(t.meetingPoint),
          itinerary: toJSON(t.itinerary),
          faqs: toJSON(t.faqs),
          includedServices: toArray(t.includedServices),
          excludedServices: toArray(t.excludedServices),
          maxGuests: t.maxGuests || null,
          rating: toNum(t.rating),
          bannerImage: t.bannerImage,
          published: t.published,
          featured: t.featured,
          latest: t.latest,
          categoryId: str(t.categoryId),
          createdAt: toDate(t.createdAt),
          updatedAt: toDate(t.updatedAt),
        },
      })
    }
    console.log(`✅ ${data.tours.length} tours`)
  }

  // ============================================================
  // 5. TOUR IMAGES
  // ============================================================
  if (data.tourImages?.length) {
    for (const i of data.tourImages) {
      try {
        await prisma.tourImage.upsert({
          where: { id: i.id },
          update: {},
          create: {
            id: i.id,
            url: i.url,
            alt: str(i.alt),
            order: i.order ?? 0,
            tourId: i.tourId,
          },
        })
      } catch (e: any) {
        console.log(`   ⚠️ Skipped tour image ${i.id}: ${e.message?.slice(0, 80)}`)
      }
    }
    console.log(`✅ ${data.tourImages.length} tour images`)
  }

  // ============================================================
  // 6. HOTELS
  // ============================================================
  if (data.hotels?.length) {
    for (const h of data.hotels) {
      await prisma.hotel.upsert({
        where: { id: h.id },
        update: {},
        create: {
          id: h.id,
          slug: h.slug,
          name: h.name,
          shortDescription: str(h.shortDescription),
          fullDescription: str(h.fullDescription),
          description: h.description,
          location: h.location,
          address: str(h.address),
          pricePerNight: toNum(h.pricePerNight),
          rating: toNum(h.rating),
          contactPhone: str(h.contactPhone),
          contactEmail: str(h.contactEmail),
          checkInTime: str(h.checkInTime),
          checkOutTime: str(h.checkOutTime),
          amenities: toArray(h.amenities),
          roomTypes: toJSON(h.roomTypes),
          bannerImage: h.bannerImage,
          published: h.published,
          featured: h.featured,
          categoryId: str(h.categoryId),
          createdAt: toDate(h.createdAt),
          updatedAt: toDate(h.updatedAt),
        },
      })
    }
    console.log(`✅ ${data.hotels.length} hotels`)
  }

  // ============================================================
  // 7. HOTEL IMAGES
  // ============================================================
  if (data.hotelImages?.length) {
    for (const i of data.hotelImages) {
      try {
        await prisma.hotelImage.upsert({
          where: { id: i.id },
          update: {},
          create: {
            id: i.id,
            url: i.url,
            alt: str(i.alt),
            order: i.order ?? 0,
            hotelId: i.hotelId,
          },
        })
      } catch (e: any) {
        console.log(`   ⚠️ Skipped hotel image ${i.id}: ${e.message?.slice(0, 80)}`)
      }
    }
    console.log(`✅ ${data.hotelImages.length} hotel images`)
  }

  // ============================================================
  // 8. DESTINATIONS
  // ============================================================
  if (data.destinations?.length) {
    for (const d of data.destinations) {
      await prisma.destination.upsert({
        where: { id: d.id },
        update: {},
        create: {
          id: d.id,
          slug: d.slug,
          name: d.name,
          shortDescription: str(d.shortDescription),
          fullDescription: str(d.fullDescription),
          description: d.description,
          location: d.location,
          image: d.image,
          published: d.published,
          featured: d.featured,
          orderNumber: d.orderNumber ?? 0,
          categoryId: str(d.categoryId),
          createdAt: toDate(d.createdAt),
          updatedAt: toDate(d.updatedAt),
        },
      })
    }
    console.log(`✅ ${data.destinations.length} destinations`)
  }

  // ============================================================
  // 9. DESTINATION ↔ TOUR links
  // ============================================================
  if (data.destinationTours?.length) {
    let count = 0
    for (const dt of data.destinationTours) {
      try {
        const existing = await prisma.destinationTour.findFirst({
          where: { destinationId: dt.destinationId, tourId: dt.tourId },
        })
        if (!existing) {
          await prisma.destinationTour.create({
            data: { destinationId: dt.destinationId, tourId: dt.tourId },
          })
          count++
        }
      } catch (e: any) {
        // Skip if referenced record doesn't exist
      }
    }
    console.log(`✅ ${data.destinationTours.length} destination-tour links (${count} new)`)
  }

  // ============================================================
  // 10. DESTINATION ↔ HOTEL links
  // ============================================================
  if (data.destinationHotels?.length) {
    let count = 0
    for (const dh of data.destinationHotels) {
      try {
        const existing = await prisma.destinationHotel.findFirst({
          where: { destinationId: dh.destinationId, hotelId: dh.hotelId },
        })
        if (!existing) {
          await prisma.destinationHotel.create({
            data: { destinationId: dh.destinationId, hotelId: dh.hotelId },
          })
          count++
        }
      } catch (e: any) {
        // Skip if referenced record doesn't exist
      }
    }
    console.log(`✅ ${data.destinationHotels.length} destination-hotel links (${count} new)`)
  }

  // ============================================================
  // 11. TESTIMONIALS
  // ============================================================
  if (data.testimonials?.length) {
    for (const t of data.testimonials) {
      await prisma.testimonial.upsert({
        where: { id: t.id },
        update: {},
        create: {
          id: t.id,
          name: t.name,
          text: t.text,
          rating: t.rating ?? 5,
          avatar: str(t.avatar),
          published: t.published,
          featured: t.featured,
          createdAt: toDate(t.createdAt),
          updatedAt: toDate(t.updatedAt),
        },
      })
    }
    console.log(`✅ ${data.testimonials.length} testimonials`)
  }

  // ============================================================
  // 12. CONTACT MESSAGES
  // ============================================================
  if (data.contactMessages?.length) {
    for (const c of data.contactMessages) {
      await prisma.contactMessage.upsert({
        where: { id: c.id },
        update: {},
        create: {
          id: c.id,
          name: c.name,
          email: c.email,
          phone: str(c.phone),
          subject: c.subject,
          message: c.message,
          status: c.status,
          createdAt: toDate(c.createdAt),
          updatedAt: toDate(c.updatedAt),
        },
      })
    }
    console.log(`✅ ${data.contactMessages.length} contact messages`)
  }

  // ============================================================
  // 13. TRIP REQUESTS
  // ============================================================
  if (data.tripRequests?.length) {
    for (const t of data.tripRequests) {
      await prisma.tripRequest.upsert({
        where: { id: t.id },
        update: {},
        create: {
          id: t.id,
          name: t.name,
          email: t.email,
          phone: t.phone,
          destination: t.destination,
          travelers: t.travelers,
          startDate: t.startDate,
          endDate: t.endDate,
          budget: str(t.budget),
          message: str(t.message),
          status: t.status,
          adminNotes: str(t.adminNotes),
          createdAt: toDate(t.createdAt),
          updatedAt: toDate(t.updatedAt),
        },
      })
    }
    console.log(`✅ ${data.tripRequests.length} trip requests`)
  }

  // ============================================================
  // 14. USERS
  // ============================================================
  if (data.users?.length) {
    for (const u of data.users) {
      await prisma.user.upsert({
        where: { id: u.id },
        update: {},
        create: {
          id: u.id,
          fullName: u.fullName,
          email: u.email,
          phone: u.phone,
          passwordHash: u.passwordHash,
          avatar: str(u.avatar),
          blocked: u.blocked ?? false,
          createdAt: toDate(u.createdAt),
        },
      })
    }
    console.log(`✅ ${data.users.length} users`)
  }

  // ============================================================
  // 15. USER PASSWORD RESET TOKENS
  // ============================================================
  if (data.userTokens?.length) {
    for (const t of data.userTokens) {
      try {
        await prisma.userPasswordResetToken.upsert({
          where: { id: t.id },
          update: {},
          create: {
            id: t.id,
            token: t.token,
            userId: t.userId,
            expiresAt: toDate(t.expiresAt),
            used: t.used,
            createdAt: toDate(t.createdAt),
          },
        })
      } catch (e: any) {
        console.log(`   ⚠️ Skipped user token ${t.id}: ${e.message?.slice(0, 80)}`)
      }
    }
    console.log(`✅ ${data.userTokens.length} user tokens`)
  }

  // ============================================================
  // 16. ORDERS
  // ============================================================
  if (data.orders?.length) {
    for (const o of data.orders) {
      await prisma.order.upsert({
        where: { id: o.id },
        update: {},
        create: {
          id: o.id,
          fullName: o.fullName,
          email: o.email,
          phone: o.phone,
          address: str(o.address),
          city: str(o.city),
          notes: str(o.notes),
          totalAmount: toNum(o.totalAmount),
          status: o.status,
          createdAt: toDate(o.createdAt),
        },
      })
    }
    console.log(`✅ ${data.orders.length} orders`)
  }

  // ============================================================
  // 17. ORDER ITEMS
  // ============================================================
  if (data.orderItems?.length) {
    for (const i of data.orderItems) {
      try {
        await prisma.orderItem.upsert({
          where: { id: i.id },
          update: {},
          create: {
            id: i.id,
            tourId: i.tourId,
            tourName: i.tourName,
            tourImage: str(i.tourImage),
            price: toNum(i.price),
            quantity: i.quantity,
            orderId: i.orderId,
          },
        })
      } catch (e: any) {
        console.log(`   ⚠️ Skipped order item ${i.id}: ${e.message?.slice(0, 80)}`)
      }
    }
    console.log(`✅ ${data.orderItems.length} order items`)
  }

  // ============================================================
  // 18. TRANSACTIONS
  // ============================================================
  if (data.transactions?.length) {
    for (const t of data.transactions) {
      try {
        await prisma.transaction.upsert({
          where: { id: t.id },
          update: {},
          create: {
            id: t.id,
            orderId: str(t.orderId),
            tracker: str(t.tracker),
            customerName: t.customerName,
            customerEmail: t.customerEmail,
            amount: t.amount,
            status: t.status,
            method: t.method,
            createdAt: toDate(t.createdAt),
            updatedAt: toDate(t.updatedAt),
          },
        })
      } catch (e: any) {
        console.log(`   ⚠️ Skipped transaction ${t.id}: ${e.message?.slice(0, 80)}`)
      }
    }
    console.log(`✅ ${data.transactions.length} transactions`)
  }

  // ============================================================
  // 19. NEWSLETTER SUBSCRIBERS
  // ============================================================
  if (data.newsletterSubscribers?.length) {
    for (const s of data.newsletterSubscribers) {
      try {
        await prisma.newsletterSubscriber.upsert({
          where: { id: s.id },
          update: {},
          create: {
            id: s.id,
            email: s.email,
            status: s.status,
            subscribedAt: toDate(s.subscribedAt),
            unsubscribedAt: s.unsubscribedAt ? toDate(s.unsubscribedAt) : null,
            createdAt: toDate(s.createdAt),
            updatedAt: toDate(s.updatedAt),
          },
        })
      } catch (e: any) {
        console.log(`   ⚠️ Skipped subscriber ${s.id}: ${e.message?.slice(0, 80)}`)
      }
    }
    console.log(`✅ ${data.newsletterSubscribers.length} newsletter subscribers`)
  }

  // ============================================================
  // 20. NEWSLETTERS
  // ============================================================
  if (data.newsletters?.length) {
    for (const n of data.newsletters) {
      await prisma.newsletter.upsert({
        where: { id: n.id },
        update: {},
        create: {
          id: n.id,
          subject: n.subject,
          title: n.title,
          content: n.content,
          image: str(n.image),
          ctaText: str(n.ctaText),
          ctaUrl: str(n.ctaUrl),
          status: n.status,
          sentAt: n.sentAt ? toDate(n.sentAt) : null,
          recipientCount: n.recipientCount ?? 0,
          createdAt: toDate(n.createdAt),
          updatedAt: toDate(n.updatedAt),
        },
      })
    }
    console.log(`✅ ${data.newsletters.length} newsletters`)
  }

  // ============================================================
  // 21. REVIEWS
  // ============================================================
  if (data.reviews?.length) {
    for (const r of data.reviews) {
      try {
        await prisma.review.upsert({
          where: { id: r.id },
          update: {},
          create: {
            id: r.id,
            userId: r.userId,
            orderId: str(r.orderId),
            tourId: r.tourId,
            rating: toNum(r.rating),
            comment: r.comment,
            images: toArray(r.images),
            status: r.status,
            adminResponse: str(r.adminResponse),
            createdAt: toDate(r.createdAt),
            updatedAt: toDate(r.updatedAt),
          },
        })
      } catch (e: any) {
        console.log(`   ⚠️ Skipped review ${r.id}: ${e.message?.slice(0, 80)}`)
      }
    }
    console.log(`✅ ${data.reviews.length} reviews`)
  }

  console.log('\n🎉 All data imported from Neon PostgreSQL into MongoDB!')
}

main()
  .catch((e) => {
    console.error('❌ Import failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
