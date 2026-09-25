'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { fetchJson } from '@/lib/fetchJson'
import DeleteButton from '@/components/admin/DeleteButton'
import ConfirmDialog from '@/components/admin/ConfirmDialog'

const DELETE_TIMEOUT_MS = 30000

export default function AdminExplorePlacesPage() {
  const [destinations, setDestinations] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [expandedCategories, setExpandedCategories] = useState({})
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [d, c] = await Promise.allSettled([
          fetchJson('/api/admin/destinations'),
          fetchJson('/api/admin/categories?type=DESTINATION'),
        ])
        if (cancelled) return
        if (d.status === 'fulfilled') setDestinations(d.value)
        if (c.status === 'fulfilled') setCategories(c.value)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  /* Group destinations by category */
  const tree = useMemo(() => {
    let filtered = destinations
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter((d) =>
        d.name.toLowerCase().includes(q) ||
        (d.location || '').toLowerCase().includes(q) ||
        (d.shortDescription || '').toLowerCase().includes(q)
      )
    }
    if (filterCategory) {
      filtered = filtered.filter((d) => d.categoryId === filterCategory)
    }

    const catMap = {}
    filtered.forEach((d) => {
      const catId = d.categoryId || 'uncategorized'
      if (!catMap[catId]) catMap[catId] = { id: catId, name: d.category?.name || 'Uncategorized', places: [] }
      catMap[catId].places.push(d)
    })
    return Object.values(catMap)
  }, [destinations, categories, search, filterCategory])

  // Reset page when search/filter changes
  const [prevSearch, setPrevSearch] = useState('')
  const [prevFilter, setPrevFilter] = useState('')
  if (search !== prevSearch || filterCategory !== prevFilter) {
    setPage(1)
    setPrevSearch(search)
    setPrevFilter(filterCategory)
  }

  const totalPages = Math.ceil(tree.length / PAGE_SIZE)
  const paginatedTree = tree.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const toggleCategory = (id) => setExpandedCategories((p) => ({ ...p, [id]: !p[id] }))

  /* ----- Bulk selection (Select All + per-row checkboxes) ----- */
  const allPlaces = tree.flatMap((cat) => cat.places)
  const allSelected = allPlaces.length > 0 && allPlaces.every((d) => selectedIds.has(d.id))
  const someSelected = selectedIds.size > 0
  // Resolve selected IDs against the full list (not the filtered view) so the
  // bulk delete targets exactly what the user ticked, regardless of search/filter.
  const selectedPlaces = destinations.filter((d) => selectedIds.has(d.id))

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
      const next = new Set(prev)
      const allSelectedNow = allPlaces.length > 0 && allPlaces.every((d) => prev.has(d.id))
      allPlaces.forEach((d) => {
        if (allSelectedNow) next.delete(d.id)
        else next.add(d.id)
      })
      return next
    })
  }

  const toggleCategoryPlaces = (cat) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      const allCatSelected = cat.places.every((d) => next.has(d.id))
      cat.places.forEach((d) => {
        if (allCatSelected) next.delete(d.id)
        else next.add(d.id)
      })
      return next
    })
  }

  const removeIds = (ids) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      ids.forEach((id) => next.delete(id))
      return next
    })
  }

  const bulkDelete = async () => {
    const ids = selectedPlaces.map((d) => d.id)
    if (ids.length === 0) return
    setConfirmOpen(false)
    setDeleting(true)
    setError('')
    try {
      const results = await Promise.allSettled(
        ids.map((id) =>
          fetchJson(`/api/admin/destinations/${id}`, { method: 'DELETE', timeoutMs: DELETE_TIMEOUT_MS })
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
      // Remove deleted rows from local state immediately (list is client-fetched,
      // so router.refresh() alone cannot re-sync it).
      const failedIds = new Set(
        results.map((r, i) => (r.status === 'rejected' ? ids[i] : null)).filter(Boolean)
      )
      removeIds(ids.filter((id) => !failedIds.has(id)))
      setDestinations((prev) => prev.filter((d) => !ids.includes(d.id) || failedIds.has(d.id)))
    } finally {
      setDeleting(false)
    }
  }

  const summary =
    selectedPlaces.length <= 5
      ? `Delete ${selectedPlaces.length} selected place${selectedPlaces.length === 1 ? '' : 's'}${selectedPlaces.length ? ` (${selectedPlaces.map((d) => d.name).join(', ')})` : ''}? This cannot be undone.`
      : `Delete ${selectedPlaces.length} selected places (including "${selectedPlaces[0].name}", "${selectedPlaces[1].name}", "${selectedPlaces[2].name}"…)? This cannot be undone.`

  return (
    <>
      {/* Header */}
      <div className="places-header">
        <div>
          <h1 className="places-title">Explore Places</h1>
          <p className="places-subtitle">Organize and manage destinations across Pakistan.</p>
        </div>
        <div className="places-header-actions">
          <div className="places-search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              placeholder="Search places, categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="places-filter-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button
            type="button"
            className="btn btn--outline"
            onClick={toggleAll}
            disabled={allPlaces.length === 0 || deleting}
          >
            {allSelected ? 'Clear All' : 'Select All'}
          </button>
          <Link href="/admin/explore-places/new" className="btn btn--primary places-add-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add New
          </Link>
        </div>
      </div>

      {/* Bulk action bar */}
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
      {error && <p className="cq-error">{error}</p>}

      {/* Tree View */}
      <div className="places-tree">
        {loading ? (
          <div className="admin-table-loading">
            <div className="page-spinner page-spinner--sm" />
            <span className="admin-table-loading__text">Loading places…</span>
          </div>
        ) : tree.length === 0 ? (
          <div className="places-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <p>No places found.</p>
            <Link href="/admin/explore-places/new" className="btn btn--primary" style={{ marginTop: '0.75rem' }}>Add your first place</Link>
          </div>
        ) : (
          paginatedTree.map((cat) => {
            const isExpanded = expandedCategories[cat.id] !== false
            return (
              <div key={cat.id} className="tree-category">
                {/* Category row */}
                <div className="tree-category__header" onClick={() => toggleCategory(cat.id)}>
                  <span className="tree-chevron">{isExpanded ? '▾' : '▸'}</span>
                  <input
                    type="checkbox"
                    aria-label={`Select all places in ${cat.name}`}
                    checked={cat.places.every((d) => selectedIds.has(d.id))}
                    ref={(el) => {
                      if (el) {
                        const any = cat.places.some((d) => selectedIds.has(d.id))
                        const all = cat.places.every((d) => selectedIds.has(d.id))
                        el.indeterminate = any && !all
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => toggleCategoryPlaces(cat)}
                    disabled={deleting}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                  <span className="tree-category__name">{cat.name}</span>
                  <span className="badge badge--outline">CATEGORY</span>
                  <span className="tree-category__count">{cat.places.length} places</span>
                </div>

                {/* Places */}
                {isExpanded && (
                  <div className="tree-category__children">
                    {cat.places.map((d) => (
                      <div key={d.id} className="tree-place" style={selectedIds.has(d.id) ? { background: '#fef2f2' } : undefined}>
                        <input
                          type="checkbox"
                          aria-label={`Select place ${d.name}`}
                          checked={selectedIds.has(d.id)}
                          onChange={() => toggleOne(d.id)}
                          disabled={deleting}
                          style={{ flexShrink: 0 }}
                        />
                        <div className="tree-place__thumb">
                          {d.image ? (
                            <img src={d.image} alt={d.name} />
                          ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                          )}
                        </div>
                        <div className="tree-place__info">
                          <div className="tree-place__name">{d.name}</div>
                          <div className="tree-place__desc">{d.shortDescription || d.description || 'No description'}</div>
                        </div>
                        <div className="tree-place__badges">
                          {d.orderNumber > 0 && <span className="badge badge--blue">#{d.orderNumber}</span>}
                          {d.featured && <span className="badge badge--green">Featured</span>}
                          {!d.published && <span className="badge badge--yellow">Draft</span>}
                        </div>
                        <div className="tree-place__actions">
                          <Link href={`/admin/explore-places/${d.id}`} className="btn btn--outline btn--sm">Edit</Link>
                          <DeleteButton
                            endpoint={`/api/admin/destinations/${d.id}`}
                            confirmText={`Delete "${d.name}"? This cannot be undone.`}
                            disabled={deleting}
                            onDeleted={() => {
                              removeIds([d.id])
                              setDestinations((prev) => prev.filter((x) => x.id !== d.id))
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="admin-pagination__row">
          <span className="admin-pagination__info">
            {tree.length} categories · Page {page} of {totalPages}
          </span>
          <div className="admin-pagination">
            {page > 1 && (
              <button className="admin-pagination__btn" onClick={() => { setPage(page - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
                ← Prev
              </button>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`admin-pagination__btn ${p === page ? 'admin-pagination__btn--active' : ''}`}
                onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              >
                {p}
              </button>
            ))}
            {page < totalPages && (
              <button className="admin-pagination__btn" onClick={() => { setPage(page + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
                Next →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      {!loading && destinations.length > 0 && (
        <div className="places-stats">
          <span>{destinations.length} total places</span>
          <span>·</span>
          <span>{destinations.filter((d) => d.featured).length} featured</span>
          <span>·</span>
          <span>{categories.length} categories</span>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Selected Places"
        message={summary}
        confirmLabel={`Delete ${selectedPlaces.length || ''}`.trim()}
        onConfirm={bulkDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  )
}
