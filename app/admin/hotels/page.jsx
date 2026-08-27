import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import Pagination from '@/components/admin/Pagination'
import DeleteButton from '@/components/admin/DeleteButton'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 10

export default async function AdminHotelsPage({ searchParams }) {
  const params = await searchParams
  const currentPage = Math.max(1, parseInt(params?.page, 10) || 1)

  const total = await prisma.hotel.count()
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const hotels = await prisma.hotel.findMany({
    orderBy: { createdAt: 'desc' },
    skip: (safePage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  })

  const start = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const end = Math.min(safePage * PAGE_SIZE, total)

  return (
    <>
      <div className="admin-header">
        <h1>Manage Hotels</h1>
        <Link href="/admin/hotels/new" className="btn btn--primary">Add Hotel</Link>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Short Description</th>
              <th>Location</th>
              <th>Price/Night</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {hotels.length === 0 ? (
              <tr><td colSpan="6" className="admin-table__empty">No hotels found.</td></tr>
            ) : hotels.map((hotel) => (
              <tr key={hotel.id}>
                <td>{hotel.name}</td>
                <td>{hotel.shortDescription}</td>
                <td>{hotel.location}</td>
                <td>PKR {Number(hotel.pricePerNight).toLocaleString('en-US')}</td>
                <td>{hotel.published ? 'Published' : 'Draft'}</td>
                <td>
                  <div className="admin-row-actions">
                    <Link href={`/admin/hotels/${hotel.id}`} className="btn btn--outline btn--sm">Edit</Link>
                    <DeleteButton
                      endpoint={`/api/admin/hotels/${hotel.id}`}
                      confirmText={`Delete hotel "${hotel.name}"? This cannot be undone.`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="admin-pagination__row">
        <span className="admin-pagination__info">{total === 0 ? 'No records' : `Showing ${start}–${end} of ${total}`}</span>
        <Pagination currentPage={safePage} totalPages={totalPages} basePath="/admin/hotels" />
      </div>
    </>
  )
}
