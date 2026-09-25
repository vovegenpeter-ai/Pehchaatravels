'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import DeleteButton from '@/components/admin/DeleteButton'
import { fetchJson } from '@/lib/fetchJson'

const DELETE_TIMEOUT_MS = 30000

export default function CategoryBulkTable({ categories, page, totalPages }) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const allSelected = categories.length > 0 && categories.every((c) => selectedIds.has(c.id))
  const someSelected = selectedIds.size > 0
  const selectedOnPage = categories.filter((c) => selectedIds.has(c.id))

  const toggleOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    setSelectedIds((prev) => {
      if (categories.length > 0 && categories.every((c) => prev.has(c.id))) {
        const next = new Set(prev)
        categories.forEach((c) => next.delete(c.id))
        return next
      }
      return new Set([...prev, ...categories.map((c) => c.id)])
    })
  }

  const handleBulkDelete = async () => {
    const ids = selectedOnPage.map((c) => c.id)
    if (ids.length === 0) return
    setConfirmOpen(false)
    setDeleting(true)
    setError('')
    try {
      const results = await Promise.allSettled(
        ids.map((id) =>
          fetchJson(`/api/admin/categories/${id}`, { method: 'DELETE', timeoutMs: DELETE_TIMEOUT_MS })
        )
      )
      const failed = results.filter((r) => r.status === 'rejected')
      if (failed.length > 0) {
        const reason = failed[0].reason instanceof Error ? failed[0].reason.message : 'Delete failed'
        setError(
          failed.length === ids.length
            ? `Delete failed: ${reason}`
            : `${ids.length - failed.length} deleted, ${failed.length} failed: ${reason}`
        )
      }
    } finally {
      setDeleting(false)
      setSelectedIds(new Set())
      // Re-sync the list even if some deletes failed — rows that are gone
      // server-side should disappear immediately.
      router.refresh()
    }
  }

  const names = selectedOnPage.map((c) => c.name)
  const summary =
    names.length <= 5
      ? `Delete ${names.length} selected categor${names.length === 1 ? 'y' : 'ies'}${names.length ? ` (${names.join(', ')})` : ''}? This cannot be undone.`
      : `Delete ${names.length} selected categories (including "${names[0]}", "${names[1]}", "${names[2]}"…)? This cannot be undone.`

  return (
    <>
      {error && <p className="cq-error">{error}</p>}

      {someSelected && (
        <div
          className="cq-toolbar"
          style={{
            marginBottom: '1rem',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <strong style={{ color: '#991b1b' }}>{selectedIds.size} selected</strong>
          <button
            type="button"
            className="btn btn--danger btn--sm"
            onClick={() => setConfirmOpen(true)}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : `Delete Selected (${selectedIds.size})`}
          </button>
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={() => setSelectedIds(new Set())}
            disabled={deleting}
          >
            Clear Selection
          </button>
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>
                <input
                  type="checkbox"
                  aria-label="Select all categories on this page"
                  checked={allSelected}
                  onChange={toggleAll}
                  disabled={categories.length === 0 || deleting}
                />
              </th>
              <th>Order</th>
              <th>Name</th>
              <th>Description</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} style={selectedIds.has(cat.id) ? { background: '#fef2f2' } : undefined}>
                <td style={{ textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    aria-label={`Select category ${cat.name}`}
                    checked={selectedIds.has(cat.id)}
                    onChange={() => toggleOne(cat.id)}
                    disabled={deleting}
                  />
                </td>
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
                      disabled={deleting}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination (server-rendered count/pages passed in) */}
      <div className="admin-pagination__row">
        <span className="admin-pagination__info">
          {totalPages > 0 ? `Page ${page} of ${totalPages}` : 'No categories'}
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

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Selected Categories"
        message={summary}
        confirmLabel={`Delete ${names.length || ''}`.trim()}
        onConfirm={handleBulkDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  )
}
