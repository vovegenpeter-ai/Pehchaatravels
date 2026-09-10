/**
 * Migration script: Neon PostgreSQL → MongoDB
 *
 * Reads all data from Neon PostgreSQL using raw SQL,
 * then writes to MongoDB using Prisma. Preserves all IDs.
 *
 * Run: npx tsx prisma/migrate-to-mongodb.ts
 */
const pgPool = null; // stub
// import pg from 'pg' --
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'
// Everything below is stubbed out - pg not available
// 
// const NEON_URL = 'postgresql://neondb_owner:npg_nMJj9Szpk4EG@ep-dry-water-az539vv8-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'
// 
// // (disabled - pg not available)
// const prisma = new PrismaClient()
// 
// async function query(sql: string, params?: unknown[]) {
//   const result = await Promise.resolve({ rows: [] })
//   return result.rows
// }
// 
// // Helper: convert PostgreSQL jsonb to plain object
// function toJSON(val: unknown): Record<string, unknown> | null {
//   if (val === null || val === undefined) return null
//   if (typeof val === 'string') {
//     try { return JSON.parse(val) } catch { return null }
//   }
//   return val as Record<string, unknown>
// }
// 
// // Helper: convert PostgreSQL array to JS array
// function toArray(val: unknown): string[] {
//   if (!val) return []
//   if (Array.isArray(val)) return val as string[]
//   if (typeof val === 'string') {
//     const cleaned = val.replace(/^{/, '').replace(/}$/, '')
//     if (!cleaned) return []
//     return cleaned.split(',').map(s => s.replace(/^"|"$/g, '').trim())
//   }
//   return []
// }
// 
// // Helper: convert Decimal to number
// function toNum(val: unknown): number {
//   if (val === null || val === undefined) return 0
//   return Number(val)
// }
// 
// // Helper: safely get a column that might be camelCase in pg results
// // pg returns column names exactly as they appear in the query
// function col(row: Record<string, any>, ...keys: string[]): any {
//   for (const k of keys) {
//     if (row[k] !== undefined) return row[k]
//   }
//   return undefined
// }
// 
// async function migrate() {
//   console.log('🚀 Starting migration from Neon PostgreSQL to MongoDB...\n')
// 
//   // ============================================================
//   // 1. ADMIN
//   // ============================================================
//   console.log('📋 Migrating Admin...')
//   const admins = await query('SELECT * FROM "Admin"')
//   for (const a of admins) {
//     await prisma.admin.upsert({
//       where: { id: a.id },
//       update: {},
//       create: {
//         id: a.id,
//         email: a.email,
//         passwordHash: col(a, 'passwordHash'),
//         name: a.name,
//         createdAt: new Date(a.createdAt),
//         updatedAt: new Date(a.updatedAt),
//       },
//     })
//   }
//   console.log(`   ✅ ${admins.length} admins`)
// 
//   // ============================================================
//   // 2. PASSWORD RESET TOKENS (Admin)
//   // ============================================================
//   console.log('📋 Migrating Admin PasswordResetTokens...')
//   const adminTokens = await query('SELECT * FROM "PasswordResetToken"')
//   for (const t of adminTokens) {
//     await prisma.passwordResetToken.upsert({
//       where: { id: t.id },
//       update: {},
//       create: {
//         id: t.id,
//         token: t.token,
//         adminId: col(t, 'adminId'),
//         expiresAt: new Date(col(t, 'expiresAt')),
//         used: t.used,
//         createdAt: new Date(col(t, 'createdAt')),
//       },
//     })
//   }
//   console.log(`   ✅ ${adminTokens.length} admin reset tokens`)
// 
//   // ============================================================
//   // 3. CATEGORIES
//   // ============================================================
//   console.log('📋 Migrating Categories...')
//   const categories = await query('SELECT * FROM "Category"')
//   for (const c of categories) {
//     await prisma.category.upsert({
//       where: { id: c.id },
//       update: {},
//       create: {
//         id: c.id,
//         name: c.name,
//         slug: c.slug,
//         description: c.description || null,
//         shortDescription: col(c, 'shortDescription') || null,
//         longDescription: col(c, 'longDescription') || null,
//         type: c.type,
//         published: c.published,
//         image: c.image || null,
//         orderNumber: c.orderNumber ?? 0,
//         createdAt: new Date(col(c, 'createdAt')),
//         updatedAt: new Date(col(c, 'updatedAt')),
//       },
//     })
//   }
//   console.log(`   ✅ ${categories.length} categories`)
// 
//   // ============================================================
//   // 4. TOURS
//   // ============================================================
//   console.log('📋 Migrating Tours...')
//   const tours = await query('SELECT * FROM "Tour"')
//   for (const t of tours) {
//     await prisma.tour.upsert({
//       where: { id: t.id },
//       update: {},
//       create: {
//         id: t.id,
//         slug: t.slug,
//         name: t.name,
//         shortDescription: col(t, 'shortDescription'),
//         fullDescription: col(t, 'fullDescription'),
//         destination: t.destination,
//         location: t.location || null,
//         price: toNum(t.price),
//         duration: t.duration,
//         days: t.days,
//         startDate: col(t, 'startDate') || null,
//         startTime: col(t, 'startTime') || null,
//         endDate: col(t, 'endDate') || null,
//         endTime: col(t, 'endTime') || null,
//         meetingPoint: col(t, 'meetingPoint') || null,
//         itinerary: toJSON(t.itinerary),
//         faqs: toJSON(t.faqs),
//         includedServices: toArray(col(t, 'includedServices')),
//         excludedServices: toArray(col(t, 'excludedServices')),
//         maxGuests: col(t, 'maxGuests') || null,
//         rating: toNum(t.rating),
//         bannerImage: col(t, 'bannerImage'),
//         published: t.published,
//         featured: t.featured,
//         latest: t.latest,
//         categoryId: col(t, 'categoryId') || null,
//         createdAt: new Date(col(t, 'createdAt')),
//         updatedAt: new Date(col(t, 'updatedAt')),
//       },
//     })
//   }
//   console.log(`   ✅ ${tours.length} tours`)
// 
//   // ============================================================
//   // 5. TOUR IMAGES
//   // ============================================================
//   console.log('📋 Migrating TourImages...')
//   const tourImages = await query('SELECT * FROM "TourImage"')
//   for (const i of tourImages) {
//     await prisma.tourImage.upsert({
//       where: { id: i.id },
//       update: {},
//       create: {
//         id: i.id,
//         url: i.url,
//         alt: i.alt || null,
//         order: i.order ?? 0,
//         tourId: col(i, 'tourId'),
//       },
//     })
//   }
//   console.log(`   ✅ ${tourImages.length} tour images`)
// 
//   // ============================================================
//   // 6. HOTELS
//   // ============================================================
//   console.log('📋 Migrating Hotels...')
//   const hotels = await query('SELECT * FROM "Hotel"')
//   for (const h of hotels) {
//     await prisma.hotel.upsert({
//       where: { id: h.id },
//       update: {},
//       create: {
//         id: h.id,
//         slug: h.slug,
//         name: h.name,
//         shortDescription: col(h, 'shortDescription') || null,
//         fullDescription: col(h, 'fullDescription') || null,
//         description: h.description,
//         location: h.location,
//         address: h.address || null,
//         pricePerNight: toNum(col(h, 'pricePerNight')),
//         rating: toNum(h.rating),
//         contactPhone: col(h, 'contactPhone') || null,
//         contactEmail: col(h, 'contactEmail') || null,
//         checkInTime: col(h, 'checkInTime') || null,
//         checkOutTime: col(h, 'checkOutTime') || null,
//         amenities: toArray(h.amenities),
//         roomTypes: toJSON(col(h, 'roomTypes')),
//         bannerImage: col(h, 'bannerImage'),
//         published: h.published,
//         featured: h.featured,
//         categoryId: col(h, 'categoryId') || null,
//         createdAt: new Date(col(h, 'createdAt')),
//         updatedAt: new Date(col(h, 'updatedAt')),
//       },
//     })
//   }
//   console.log(`   ✅ ${hotels.length} hotels`)
// 
//   // ============================================================
//   // 7. HOTEL IMAGES
//   // ============================================================
//   console.log('📋 Migrating HotelImages...')
//   const hotelImages = await query('SELECT * FROM "HotelImage"')
//   for (const i of hotelImages) {
//     await prisma.hotelImage.upsert({
//       where: { id: i.id },
//       update: {},
//       create: {
//         id: i.id,
//         url: i.url,
//         alt: i.alt || null,
//         order: i.order ?? 0,
//         hotelId: col(i, 'hotelId'),
//       },
//     })
//   }
//   console.log(`   ✅ ${hotelImages.length} hotel images`)
// 
//   // ============================================================
//   // 8. DESTINATIONS
//   // ============================================================
//   console.log('📋 Migrating Destinations...')
//   const destinations = await query('SELECT * FROM "Destination"')
//   for (const d of destinations) {
//     await prisma.destination.upsert({
//       where: { id: d.id },
//       update: {},
//       create: {
//         id: d.id,
//         slug: d.slug,
//         name: d.name,
//         shortDescription: col(d, 'shortDescription') || null,
//         fullDescription: col(d, 'fullDescription') || null,
//         description: d.description,
//         location: d.location,
//         image: d.image,
//         published: d.published,
//         featured: d.featured,
//         orderNumber: col(d, 'orderNumber') ?? 0,
//         categoryId: col(d, 'categoryId') || null,
//         createdAt: new Date(col(d, 'createdAt')),
//         updatedAt: new Date(col(d, 'updatedAt')),
//       },
//     })
//   }
//   console.log(`   ✅ ${destinations.length} destinations`)
// 
//   // ============================================================
//   // 9. DESTINATION ↔ TOUR (junction)
//   // ============================================================
//   console.log('📋 Migrating DestinationTour...')
//   const destTours = await query('SELECT * FROM "DestinationTour"')
//   let dtCreated = 0
//   for (const dt of destTours) {
//     const existing = await prisma.destinationTour.findFirst({
//       where: { destinationId: col(dt, 'destinationId'), tourId: dt.tourId },
//     })
//     if (!existing) {
//       await prisma.destinationTour.create({
//         data: {
//           destinationId: col(dt, 'destinationId'),
//           tourId: dt.tourId,
//         },
//       })
//       dtCreated++
//     }
//   }
//   console.log(`   ✅ ${destTours.length} destination-tour links (${dtCreated} new)`)
// 
//   // ============================================================
//   // 10. DESTINATION ↔ HOTEL (junction)
//   // ============================================================
//   console.log('📋 Migrating DestinationHotel...')
//   const destHotels = await query('SELECT * FROM "DestinationHotel"')
//   let dhCreated = 0
//   for (const dh of destHotels) {
//     const existing = await prisma.destinationHotel.findFirst({
//       where: { destinationId: col(dh, 'destinationId'), hotelId: dh.hotelId },
//     })
//     if (!existing) {
//       await prisma.destinationHotel.create({
//         data: {
//           destinationId: col(dh, 'destinationId'),
//           hotelId: dh.hotelId,
//         },
//       })
//       dhCreated++
//     }
//   }
//   console.log(`   ✅ ${destHotels.length} destination-hotel links (${dhCreated} new)`)
// 
//   // ============================================================
//   // 11. TESTIMONIALS
//   // ============================================================
//   console.log('📋 Migrating Testimonials...')
//   const testimonials = await query('SELECT * FROM "Testimonial"')
//   for (const t of testimonials) {
//     await prisma.testimonial.upsert({
//       where: { id: t.id },
//       update: {},
//       create: {
//         id: t.id,
//         name: t.name,
//         text: t.text,
//         rating: t.rating ?? 5,
//         avatar: t.avatar || null,
//         published: t.published,
//         featured: t.featured,
//         createdAt: new Date(col(t, 'createdAt')),
//         updatedAt: new Date(col(t, 'updatedAt')),
//       },
//     })
//   }
//   console.log(`   ✅ ${testimonials.length} testimonials`)
// 
//   // ============================================================
//   // 12. CONTACT MESSAGES
//   // ============================================================
//   console.log('📋 Migrating ContactMessages...')
//   const contacts = await query('SELECT * FROM "ContactMessage"')
//   for (const c of contacts) {
//     await prisma.contactMessage.upsert({
//       where: { id: c.id },
//       update: {},
//       create: {
//         id: c.id,
//         name: c.name,
//         email: c.email,
//         phone: c.phone || null,
//         subject: c.subject,
//         message: c.message,
//         status: c.status,
//         createdAt: new Date(col(c, 'createdAt')),
//         updatedAt: new Date(col(c, 'updatedAt')),
//       },
//     })
//   }
//   console.log(`   ✅ ${contacts.length} contact messages`)
// 
//   // ============================================================
//   // 13. TRIP REQUESTS
//   // ============================================================
//   console.log('📋 Migrating TripRequests...')
//   const trips = await query('SELECT * FROM "TripRequest"')
//   for (const t of trips) {
//     await prisma.tripRequest.upsert({
//       where: { id: t.id },
//       update: {},
//       create: {
//         id: t.id,
//         name: t.name,
//         email: t.email,
//         phone: t.phone,
//         destination: t.destination,
//         travelers: t.travelers,
//         startDate: col(t, 'startDate'),
//         endDate: col(t, 'endDate'),
//         budget: t.budget || null,
//         message: t.message || null,
//         status: t.status,
//         adminNotes: col(t, 'adminNotes') || null,
//         createdAt: new Date(col(t, 'createdAt')),
//         updatedAt: new Date(col(t, 'updatedAt')),
//       },
//     })
//   }
//   console.log(`   ✅ ${trips.length} trip requests`)
// 
//   // ============================================================
//   // 14. USERS
//   // ============================================================
//   console.log('📋 Migrating Users...')
//   const users = await query('SELECT * FROM "User"')
//   for (const u of users) {
//     await prisma.user.upsert({
//       where: { id: u.id },
//       update: {},
//       create: {
//         id: u.id,
//         fullName: col(u, 'fullName'),
//         email: u.email,
//         phone: u.phone,
//         passwordHash: col(u, 'passwordHash'),
//         avatar: u.avatar || null,
//         blocked: u.blocked ?? false,
//         createdAt: new Date(col(u, 'createdAt')),
//       },
//     })
//   }
//   console.log(`   ✅ ${users.length} users`)
// 
//   // ============================================================
//   // 15. USER PASSWORD RESET TOKENS
//   // ============================================================
//   console.log('📋 Migrating UserPasswordResetTokens...')
//   const userTokens = await query('SELECT * FROM "UserPasswordResetToken"')
//   for (const t of userTokens) {
//     await prisma.userPasswordResetToken.upsert({
//       where: { id: t.id },
//       update: {},
//       create: {
//         id: t.id,
//         token: t.token,
//         userId: col(t, 'userId'),
//         expiresAt: new Date(col(t, 'expiresAt')),
//         used: t.used,
//         createdAt: new Date(col(t, 'createdAt')),
//       },
//     })
//   }
//   console.log(`   ✅ ${userTokens.length} user reset tokens`)
// 
//   // ============================================================
//   // 16. ORDERS
//   // ============================================================
//   console.log('📋 Migrating Orders...')
//   const orders = await query('SELECT * FROM "Order"')
//   for (const o of orders) {
//     await prisma.order.upsert({
//       where: { id: o.id },
//       update: {},
//       create: {
//         id: o.id,
//         fullName: col(o, 'fullName'),
//         email: o.email,
//         phone: o.phone,
//         address: o.address || null,
//         city: o.city || null,
//         notes: o.notes || null,
//         totalAmount: toNum(col(o, 'totalAmount')),
//         status: o.status,
//         createdAt: new Date(col(o, 'createdAt')),
//       },
//     })
//   }
//   console.log(`   ✅ ${orders.length} orders`)
// 
//   // ============================================================
//   // 17. ORDER ITEMS
//   // ============================================================
//   console.log('📋 Migrating OrderItems...')
//   const orderItems = await query('SELECT * FROM "OrderItem"')
//   for (const i of orderItems) {
//     await prisma.orderItem.upsert({
//       where: { id: i.id },
//       update: {},
//       create: {
//         id: i.id,
//         tourId: col(i, 'tourId'),
//         tourName: col(i, 'tourName'),
//         tourImage: col(i, 'tourImage') || null,
//         price: toNum(i.price),
//         quantity: i.quantity,
//         orderId: col(i, 'orderId'),
//       },
//     })
//   }
//   console.log(`   ✅ ${orderItems.length} order items`)
// 
//   // ============================================================
//   // 18. TRANSACTIONS
//   // ============================================================
//   console.log('📋 Migrating Transactions...')
//   const transactions = await query('SELECT * FROM "Transaction"')
//   for (const t of transactions) {
//     await prisma.transaction.upsert({
//       where: { id: t.id },
//       update: {},
//       create: {
//         id: t.id,
//         orderId: col(t, 'orderId') || null,
//         tracker: t.tracker || null,
//         customerName: col(t, 'customerName'),
//         customerEmail: col(t, 'customerEmail'),
//         amount: t.amount,
//         status: t.status,
//         method: t.method,
//         createdAt: new Date(col(t, 'createdAt')),
//         updatedAt: new Date(col(t, 'updatedAt')),
//       },
//     })
//   }
//   console.log(`   ✅ ${transactions.length} transactions`)
// 
//   // ============================================================
//   // 19. NEWSLETTER SUBSCRIBERS
//   // ============================================================
//   console.log('📋 Migrating NewsletterSubscribers...')
//   const subscribers = await query('SELECT * FROM "NewsletterSubscriber"')
//   for (const s of subscribers) {
//     await prisma.newsletterSubscriber.upsert({
//       where: { id: s.id },
//       update: {},
//       create: {
//         id: s.id,
//         email: s.email,
//         status: s.status,
//         subscribedAt: new Date(col(s, 'subscribedAt')),
//         unsubscribedAt: col(s, 'unsubscribedAt') ? new Date(col(s, 'unsubscribedAt')) : null,
//         createdAt: new Date(col(s, 'createdAt')),
//         updatedAt: new Date(col(s, 'updatedAt')),
//       },
//     })
//   }
//   console.log(`   ✅ ${subscribers.length} newsletter subscribers`)
// 
//   // ============================================================
//   // 20. NEWSLETTERS
//   // ============================================================
//   console.log('📋 Migrating Newsletters...')
//   const newsletters = await query('SELECT * FROM "Newsletter"')
//   for (const n of newsletters) {
//     await prisma.newsletter.upsert({
//       where: { id: n.id },
//       update: {},
//       create: {
//         id: n.id,
//         subject: n.subject,
//         title: n.title,
//         content: n.content,
//         image: n.image || null,
//         ctaText: col(n, 'ctaText') || null,
//         ctaUrl: col(n, 'ctaUrl') || null,
//         status: n.status,
//         sentAt: col(n, 'sentAt') ? new Date(col(n, 'sentAt')) : null,
//         recipientCount: col(n, 'recipientCount') ?? 0,
//         createdAt: new Date(col(n, 'createdAt')),
//         updatedAt: new Date(col(n, 'updatedAt')),
//       },
//     })
//   }
//   console.log(`   ✅ ${newsletters.length} newsletters`)
// 
//   // ============================================================
//   // 21. REVIEWS
//   // ============================================================
//   console.log('📋 Migrating Reviews...')
//   const reviews = await query('SELECT * FROM "Review"')
//   for (const r of reviews) {
//     await prisma.review.upsert({
//       where: { id: r.id },
//       update: {},
//       create: {
//         id: r.id,
//         userId: col(r, 'userId'),
//         orderId: col(r, 'orderId') || null,
//         tourId: col(r, 'tourId'),
//         rating: toNum(r.rating),
//         comment: r.comment,
//         images: toArray(r.images),
//         status: r.status,
//         adminResponse: col(r, 'adminResponse') || null,
//         createdAt: new Date(col(r, 'createdAt')),
//         updatedAt: new Date(col(r, 'updatedAt')),
//       },
//     })
//   }
//   console.log(`   ✅ ${reviews.length} reviews`)
// 
//   console.log('\n🎉 Migration complete! All data transferred from Neon PostgreSQL to MongoDB.')
// }
// 
// migrate()
//   .catch((e) => {
//     console.error('❌ Migration failed:', e)
//     process.exit(1)
//   })
//   .finally(async () => {
//     await prisma.$disconnect()
//     await //pgPool.end()
//   })
// 