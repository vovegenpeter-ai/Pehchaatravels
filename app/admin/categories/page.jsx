import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import DeleteButton from '@/components/admin/DeleteButton'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 10

export default async function AdminCategoriesPage({ searchParams }) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params?.page || '1', 10))

  const [allCategories, total] = await Promise.all([
    prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.count(),
  ])

  // Sort by orderNumber ascending, then newest first
  allCategories.sort((a, b) => {
    const aOrder = a.orderNumber ?? 0
    const bOrder = b.orderNumber ?? 0
    if (aOrder !== bOrder) return aOrder - bOrder
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const categories = allCategories.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <>
      <div className="admin-header">
        <h1>Places Category</h1>
        <Link href="/admin/categories/new" className="btn btn--primary">Add Category</Link>
      </div>

      {categories.length === 0 ? (
        <div className="admin-table-wrap">
          <div className="admin-table__empty" style={{ padding: '3rem' }}>No categories found.</div>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td><span className="badge badge--blue">{cat.orderNumber ?? 0}</span></td>
                  <td><span className="places-tree__name">{cat.name}</span></td>
                  <td><span className="places-tree__desc" style={{ fontSize: '0.85rem', color: '#64748b' }}>{cat.description || '—'}</span></td>
                  <td>
                    {cat.published
                      ? <span className="badge badge--green">Published</span>
                      : <span className="badge badge--yellow">Draft</span>
                    }
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
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
      )}

      {/* Pagination */}
      <div className="admin-pagination__row">
        <span className="admin-pagination__info">
          {total} categories · Page {page} of {totalPages}
        </span>
        {totalPages > 1 && (
          <div className="admin-pagination">
            {page > 1 && (
              <Link href={`/admin/categories?page=${page - 1}`} className="admin-pagination__btn">
                ← Prev
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/admin/categories?page=${p}`}
                className={`admin-pagination__btn ${p === page ? 'admin-pagination__btn--active' : ''}`}
              >
                {p}
              </Link>
            ))}
            {page < totalPages && (
              <Link href={`/admin/categories?page=${page + 1}`} className="admin-pagination__btn">
                Next →
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  )
}
