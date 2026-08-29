import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import Pagination from '@/components/admin/Pagination'
import DeleteButton from '@/components/admin/DeleteButton'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 10

export default async function AdminCategoriesPage({ searchParams }) {
  const params = await searchParams
  const currentPage = Math.max(1, parseInt(params?.page, 10) || 1)

  const total = await prisma.category.count()
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    skip: (safePage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  })

  const start = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const end = Math.min(safePage * PAGE_SIZE, total)

  return (
    <>
      <div className="admin-header">
        <h1>Manage Categories</h1>
        <Link href="/admin/categories/new" className="btn btn--primary">Add Category</Link>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr><td colSpan="4" className="admin-table__empty">No categories found.</td></tr>
            ) : categories.map((cat) => (
              <tr key={cat.id}>
                <td>{cat.name}</td>
                <td>{cat.type}</td>
                <td>{cat.published ? 'Published' : 'Draft'}</td>
                <td>
                  <div className="admin-row-actions">
                    <Link href={`/admin/categories/${cat.id}`} className="btn btn--outline btn--sm">Edit</Link>
                    <DeleteButton
                      endpoint={`/api/admin/categories/${cat.id}`}
                      confirmText={`Delete category "${cat.name}"? This cannot be undone.`}
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
        <Pagination currentPage={safePage} totalPages={totalPages} basePath="/admin/categories" />
      </div>
    </>
  )
}
