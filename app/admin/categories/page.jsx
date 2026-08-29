import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import DeleteButton from '@/components/admin/DeleteButton'

export const dynamic = 'force-dynamic'

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { children: { orderBy: { name: 'asc' } } },
  })

  /* Only show top-level categories (no parentId) */
  const topLevel = categories.filter((c) => !c.parentId)
  const total = categories.length

  return (
    <>
      <div className="admin-header">
        <h1>Manage Categories</h1>
        <Link href="/admin/categories/new" className="btn btn--primary">Add Category</Link>
      </div>

      {total === 0 ? (
        <div className="admin-table-wrap">
          <div className="admin-table__empty" style={{ padding: '3rem' }}>No categories found.</div>
        </div>
      ) : (
        <div className="places-tree">
          {topLevel.map((cat) => (
            <div key={cat.id} className="tree-category">
              {/* Category row */}
              <div className="tree-category__header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                <span className="tree-category__name">{cat.name}</span>
                <span className="badge badge--outline">{cat.type}</span>
                {!cat.published && <span className="badge badge--yellow">Draft</span>}
                <span className="tree-category__count">
                  {cat.children.length} subcategories
                </span>
                <div className="tree-place__actions" style={{ marginLeft: 'auto' }}>
                  <Link href={`/admin/categories/${cat.id}`} className="btn btn--outline btn--sm">Edit</Link>
                  <DeleteButton
                    endpoint={`/api/admin/categories/${cat.id}`}
                    confirmText={`Delete category "${cat.name}"? This cannot be undone.`}
                  />
                </div>
              </div>

              {/* Subcategories */}
              {cat.children.length > 0 && (
                <div className="tree-category__children">
                  {cat.children.map((sub) => (
                    <div key={sub.id} className="tree-subcategory">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                      <span className="tree-subcategory__name">{sub.name}</span>
                      {sub.description && <span className="tree-subcategory__desc">{sub.description}</span>}
                      {!sub.published && <span className="badge badge--yellow" style={{ marginLeft: 4 }}>Draft</span>}
                      <div className="tree-place__actions" style={{ marginLeft: 'auto' }}>
                        <Link href={`/admin/categories/${sub.id}`} className="btn btn--outline btn--sm">Edit</Link>
                        <DeleteButton
                          endpoint={`/api/admin/categories/${sub.id}`}
                          confirmText={`Delete subcategory "${sub.name}"? This cannot be undone.`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add subcategory link */}
              <div className="tree-category__children">
                <Link
                  href={`/admin/categories/new?parentId=${cat.id}&type=${cat.type}`}
                  className="tree-add-subcategory"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add Subcategory
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="places-stats" style={{ marginTop: '1rem' }}>
        <span>{total} total categories</span>
        <span>·</span>
        <span>{topLevel.length} top-level</span>
        <span>·</span>
        <span>{total - topLevel.length} subcategories</span>
      </div>
    </>
  )
}
