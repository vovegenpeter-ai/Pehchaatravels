import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import Pagination from '@/components/admin/Pagination'
import DeleteButton from '@/components/admin/DeleteButton'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 10

export default async function AdminDestinationsPage({ searchParams }) {
  const params = await searchParams
  const currentPage = Math.max(1, parseInt(params?.page, 10) || 1)

  const total = await prisma.destination.count()
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const destinations = await prisma.destination.findMany({
    orderBy: { name: 'asc' },
    skip: (safePage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  })

  const start = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const end = Math.min(safePage * PAGE_SIZE, total)

  return (
    <>
      <div className="admin-header">
        <h1>Manage Destinations</h1>
        <Link href="/admin/destinations/new" className="btn btn--primary">Add Destination</Link>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Short Description</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {destinations.length === 0 ? (
              <tr><td colSpan="5" className="admin-table__empty">No destinations found.</td></tr>
            ) : destinations.map((dest) => (
              <tr key={dest.id}>
                <td>{dest.name}</td>
                <td>{dest.shortDescription}</td>
                <td>{dest.location}</td>
                <td>
                  {dest.published ? 'Published' : 'Draft'}
                  {dest.featured && <span className="badge badge--green" style={{ marginLeft: 6 }}>Featured</span>}
                </td>
                <td>
                  <div className="admin-row-actions">
                    <Link href={`/admin/destinations/${dest.id}`} className="btn btn--outline btn--sm">Edit</Link>
                    <DeleteButton
                      endpoint={`/api/admin/destinations/${dest.id}`}
                      confirmText={`Delete destination "${dest.name}"? This cannot be undone.`}
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
        <Pagination currentPage={safePage} totalPages={totalPages} basePath="/admin/destinations" />
      </div>
    </>
  )
}
