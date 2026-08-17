import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  // Sequential queries: the local dev database (Prisma PGlite) is unstable
  // under concurrent queries, so avoid Promise.all here.
  const tours = await prisma.tour.count()
  const hotels = await prisma.hotel.count()
  const destinations = await prisma.destination.count()
  const categories = await prisma.category.count()
  const messages = await prisma.contactMessage.count()

  return (
    <>
      <div className="admin-header">
        <h1>Dashboard</h1>
      </div>
      <div className="admin-stats">
        <div className="admin-stat-card"><strong>{tours}</strong><span>Tours</span></div>
        <div className="admin-stat-card"><strong>{hotels}</strong><span>Hotels</span></div>
        <div className="admin-stat-card"><strong>{destinations}</strong><span>Destinations</span></div>
        <div className="admin-stat-card"><strong>{categories}</strong><span>Categories</span></div>
      </div>
      <p style={{ color: 'var(--text-light)' }}>Contact messages received: {messages}</p>
    </>
  )
}
