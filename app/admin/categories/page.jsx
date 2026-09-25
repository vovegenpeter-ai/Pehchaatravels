import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import CategoryBulkTable from '@/components/admin/CategoryBulkTable'

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

  // Sort: custom order (orderNumber > 0) first ascending, then unordered (0) by newest
  allCategories.sort((a, b) => {
    const aOrder = (a.orderNumber ?? 0) > 0 ? a.orderNumber : Infinity
    const bOrder = (b.orderNumber ?? 0) > 0 ? b.orderNumber : Infinity
    return aOrder === bOrder
      ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      : aOrder - bOrder
  })

  const totalPages = Math.ceil(total / PAGE_SIZE)

  // Keep stale ?page= values (e.g. after bulk-deleting the last row of the last
  // page) from showing an empty table.
  if (total > 0 && page > totalPages) {
    redirect(`/admin/categories?page=${totalPages}`)
  }

  const categories = allCategories.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <>
      <div className="admin-header">
        <h1>Places Category</h1>
        <Link href="/admin/categories/new" className="btn btn--primary">Add Category</Link>
      </div>

      {categories.length === 0 ? (
        <div className="admin-table-wrap">
          <div className="admin-table__empty" style={{ padding: '3rem' }}>No categories found.</div>
          {totalPages > 0 && page > 1 && (
            <div className="admin-pagination__row">
              <Link href={`/admin/categories?page=${totalPages}`} className="admin-pagination__btn">
                ← Back to page {totalPages}
              </Link>
            </div>
          )}
        </div>
      ) : (
        <CategoryBulkTable categories={categories} page={page} totalPages={totalPages} />
      )}
    </>
  )
}
