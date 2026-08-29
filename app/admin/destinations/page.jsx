'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { fetchJson } from '@/lib/fetchJson'
import DeleteButton from '@/components/admin/DeleteButton'

export default function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [expandedCategories, setExpandedCategories] = useState({})
  const [expandedLocations, setExpandedLocations] = useState({})

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [d, c] = await Promise.allSettled([
          fetchJson('/api/admin/destinations'),
          fetchJson('/api/admin/categories'),
        ])
        if (cancelled) return
        if (d.status === 'fulfilled') setDestinations(d.value)
        if (c.status === 'fulfilled') {
          const destCats = c.value.filter((cat) => cat.type === 'DESTINATION' && !cat.parentId)
          setCategories(destCats)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  /* Group destinations: Category → Subcategory → Places */
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
      /* Filter by category or any of its subcategories */
      const catIds = categories
        .filter((c) => c.id === filterCategory || c.parentId === filterCategory)
        .map((c) => c.id)
      filtered = filtered.filter((d) => catIds.includes(d.categoryId))
    }

    const catMap = {}
    filtered.forEach((d) => {
      const catId = d.categoryId || 'uncategorized'
      if (!catMap[catId]) catMap[catId] = { id: catId, name: d.category?.name || 'Uncategorized', subcategories: {} }

      /* Check if this destination points to a subcategory (has a parentId) */
      const cat = categories.find((c) => c.id === catId)
      if (cat && cat.parentId) {
        /* This is a subcategory — group under parent */
        const parentId = cat.parentId
        if (!catMap[parentId]) catMap[parentId] = { id: parentId, name: '', subcategories: {} }
        if (!catMap[parentId].subcategories[catId]) catMap[parentId].subcategories[catId] = { name: cat.name, places: [] }
        catMap[parentId].subcategories[catId].places.push(d)
        if (!catMap[parentId].name) catMap[parentId].name = categories.find((c) => c.id === parentId)?.name || 'Unknown'
      } else {
        /* Directly under category — group by location as pseudo-subcategory */
        const loc = d.location || 'Other'
        if (!catMap[catId].subcategories[loc]) catMap[catId].subcategories[loc] = { name: loc, places: [] }
        catMap[catId].subcategories[loc].places.push(d)
      }
    })
    return Object.values(catMap)
  }, [destinations, categories, search, filterCategory])

  const toggleCategory = (id) => setExpandedCategories((p) => ({ ...p, [id]: !p[id] }))
  const toggleLocation = (key) => setExpandedLocations((p) => ({ ...p, [key]: !p[key] }))

  return (
    <>
      {/* ── Header ── */}
      <div className="places-header">
        <div>
          <h1 className="places-title">Places Management</h1>
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
          <Link href="/admin/destinations/new" className="btn btn--primary places-add-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add New
          </Link>
        </div>
      </div>

      {/* ── Tree View ── */}
      <div className="places-tree">
        {loading ? (
          <div className="places-empty">Loading places...</div>
        ) : tree.length === 0 ? (
          <div className="places-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <p>No places found.</p>
            <Link href="/admin/destinations/new" className="btn btn--primary" style={{ marginTop: '0.75rem' }}>Add your first place</Link>
          </div>
        ) : (
          tree.map((cat) => {
            const isExpanded = expandedCategories[cat.id] !== false
            const subKeys = Object.keys(cat.subcategories)
            return (
              <div key={cat.id} className="tree-category">
                {/* Category row */}
                <div className="tree-category__header" onClick={() => toggleCategory(cat.id)}>
                  <span className="tree-chevron">{isExpanded ? '▾' : '▸'}</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                  <span className="tree-category__name">{cat.name}</span>
                  <span className="badge badge--outline">CATEGORY</span>
                  <span className="tree-category__count">{Object.values(cat.subcategories).reduce((n, s) => n + s.places.length, 0)} places</span>
                </div>

                {/* Subcategories & Places */}
                {isExpanded && (
                  <div className="tree-category__children">
                    {subKeys.map((subKey) => {
                      const locExpanded = expandedLocations[`${cat.id}-${subKey}`] !== false
                      const sub = cat.subcategories[subKey]
                      return (
                        <div key={subKey} className="tree-location">
                          <div className="tree-location__header" onClick={() => toggleLocation(`${cat.id}-${subKey}`)}>
                            <span className="tree-chevron">{locExpanded ? '▾' : '▸'}</span>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                            <span className="tree-location__name">{sub.name}</span>
                            <span className="tree-location__count">{sub.places.length}</span>
                          </div>

                          {locExpanded && (
                            <div className="tree-location__children">
                              {sub.places.map((d) => (
                                <div key={d.id} className="tree-place">
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
                                    {d.featured && <span className="badge badge--green">Featured</span>}
                                    {!d.published && <span className="badge badge--yellow">Draft</span>}
                                  </div>
                                  <div className="tree-place__actions">
                                    <Link href={`/admin/destinations/${d.id}`} className="btn btn--outline btn--sm">Edit</Link>
                                    <DeleteButton
                                      endpoint={`/api/admin/destinations/${d.id}`}
                                      confirmText={`Delete "${d.name}"? This cannot be undone.`}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* ── Stats ── */}
      {!loading && destinations.length > 0 && (
        <div className="places-stats">
          <span>{destinations.length} total places</span>
          <span>·</span>
          <span>{destinations.filter((d) => d.featured).length} featured</span>
          <span>·</span>
          <span>{categories.length} categories</span>
        </div>
      )}
    </>
  )
}
