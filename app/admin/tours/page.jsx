import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import Pagination from '@/components/admin/Pagination'
import DeleteButton from '@/components/admin/DeleteButton'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 10

export default async function AdminToursPage({ searchParams }) {
  const params = await searchParams
  const currentPage = Math.max(1, parseInt(params?.page, 10) || 1)

  const total = await prisma.tour.count()
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const tours = await prisma.tour.findMany({
    orderBy: { createdAt: 'desc' },
    skip: (safePage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  })

  const start = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const end = Math.min(safePage * PAGE_SIZE, total)

  return (
    <>
      <div className="admin-header">
        <h1>Manage Tours</h1>
        <Link href="/admin/tours/new" className="btn btn--primary">Add Tour</Link>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Status</th>
              <th>Flags</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tours.length === 0 ? (
              <tr><td colSpan="5" className="admin-table__empty">No tours found.</td></tr>
            ) : tours.map((tour) => (
              <tr key={tour.id}>
                <td>{tour.name}</td>
                <td>PKR {Number(tour.price).toLocaleString('en-US')}</td>
                <td>{tour.published ? 'Published' : 'Draft'}</td>
                <td>
                  {tour.featured && 'Featured '}
                  {tour.popular && 'Popular '}
                  {tour.latest && 'Latest'}
                </td>
                <td>
                  <div className="admin-row-actions">
                    <Link href={`/admin/tours/${tour.id}`} className="btn btn--outline btn--sm">Edit</Link>
                    <DeleteButton
                      endpoint={`/api/admin/tours/${tour.id}`}
                      confirmText={`Delete tour "${tour.name}"? This cannot be undone.`}
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
        <Pagination currentPage={safePage} totalPages={totalPages} basePath="/admin/tours" />
      </div>
    </>
  )
}
