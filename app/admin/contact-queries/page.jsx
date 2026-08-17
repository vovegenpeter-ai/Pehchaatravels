'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

const STATUS_LABELS = {
  NEW: 'New',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
}

const STATUS_FILTERS = [
  { value: '', label: 'All Statuses' },
  { value: 'NEW', label: 'New' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
]

const PAGE_SIZE = 10

export default function ContactQueriesPage() {
  const [queries, setQueries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [page, setPage] = useState(1)

  const fetchQueries = useCallback(async () => {
    setLoading(true)
    setError('')
    setPage(1)
    try {
      const params = new URLSearchParams()
      if (search.trim()) params.set('search', search.trim())
      if (status) params.set('status', status)
      const res = await fetch(`/api/admin/contact-queries?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load contact queries')
      setQueries(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load contact queries')
    } finally {
      setLoading(false)
    }
  }, [search, status])

  useEffect(() => {
    const timer = setTimeout(fetchQueries, 200)
    return () => clearTimeout(timer)
  }, [fetchQueries])

  const updateStatus = async (id, nextStatus) => {
    setError('')
    try {
      const res = await fetch(`/api/admin/contact-queries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      setQueries((prev) => prev.map((q) => (q.id === id ? { ...q, status: nextStatus } : q)))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update status')
    }
  }

  const formatDate = (iso) =>
    new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })

  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id))

  const counts = useMemo(() => {
    const total = queries.length
    const resolved = queries.filter((q) => q.status === 'RESOLVED').length
    return { total, resolved }
  }, [queries])

  const totalPages = Math.max(1, Math.ceil(queries.length / PAGE_SIZE))
  const pageQueries = queries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const pageStart = queries.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const pageEnd = Math.min(page * PAGE_SIZE, queries.length)

  const goToPage = (next) => {
    if (next < 1 || next > totalPages) return
    setPage(next)
    setExpandedId(null)
  }

  return (
    <>
      <div className="admin-header">
        <h1>Contact Queries</h1>
        {!loading && queries.length > 0 && (
          <span className="cq-summary">
            {counts.total} shown · {counts.resolved} resolved
          </span>
        )}
      </div>

      <div className="cq-toolbar">
        <input
          type="search"
          className="cq-search"
          placeholder="Search by name, email, phone, subject or message…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="cq-select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
        >
          {STATUS_FILTERS.map((f) => (
            <option key={f.value || 'all'} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      {error && <p className="cq-error">{error}</p>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Subject</th>
              <th>Received</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="cq-empty">Loading queries…</td>
              </tr>
            ) : pageQueries.length === 0 ? (
              <tr>
                <td colSpan="7" className="cq-empty">No contact queries found.</td>
              </tr>
            ) : (
              pageQueries.map((q) => (
                <QueryRow
                  key={q.id}
                  query={q}
                  expanded={expandedId === q.id}
                  onToggle={() => toggleExpand(q.id)}
                  onStatusChange={updateStatus}
                  formatDate={formatDate}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && queries.length > 0 && (
        <div className="admin-pagination__row">
          <span className="admin-pagination__info">Showing {pageStart}–{pageEnd} of {queries.length}</span>
          <nav className="admin-pagination" aria-label="Pagination">
            <button
              type="button"
              className="admin-pagination__btn"
              disabled={page === 1}
              onClick={() => goToPage(page - 1)}
              aria-label="Previous page"
            >
              ‹ Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                className={`admin-pagination__btn${p === page ? ' admin-pagination__btn--active' : ''}`}
                onClick={() => goToPage(p)}
                aria-current={p === page ? 'page' : undefined}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              className="admin-pagination__btn"
              disabled={page === totalPages}
              onClick={() => goToPage(page + 1)}
              aria-label="Next page"
            >
              Next ›
            </button>
          </nav>
        </div>
      )}
    </>
  )
}

function QueryRow({ query, expanded, onToggle, onStatusChange, formatDate }) {
  return (
    <>
      <tr className={expanded ? 'cq-row cq-row--expanded' : 'cq-row'}>
        <td>{query.name}</td>
        <td>
          <a href={`mailto:${query.email}`} className="cq-link">{query.email}</a>
        </td>
        <td>{query.phone || '—'}</td>
        <td>{query.subject}</td>
        <td>{formatDate(query.createdAt)}</td>
        <td>
          <select
            className={`cq-status cq-status--${query.status}`}
            value={query.status}
            onChange={(e) => onStatusChange(query.id, e.target.value)}
            aria-label={`Status for ${query.name}`}
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </td>
        <td>
          <button type="button" className="btn btn--outline btn--sm" onClick={onToggle}>
            {expanded ? 'Hide Details' : 'View Details'}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="cq-detail">
          <td colSpan="7">
            <div className="cq-detail__grid">
              <div>
                <strong>Name</strong>
                <p>{query.name}</p>
              </div>
              <div>
                <strong>Email</strong>
                <p>
                  <a href={`mailto:${query.email}`} className="cq-link">{query.email}</a>
                </p>
              </div>
              <div>
                <strong>Phone</strong>
                <p>{query.phone || 'Not provided'}</p>
              </div>
              <div>
                <strong>Subject</strong>
                <p>{query.subject}</p>
              </div>
              <div>
                <strong>Received</strong>
                <p>{formatDate(query.createdAt)}</p>
              </div>
              <div>
                <strong>Status</strong>
                <p>{STATUS_LABELS[query.status]}</p>
              </div>
            </div>
            <div className="cq-detail__message">
              <strong>Message</strong>
              <p>{query.message}</p>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
