'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

const STATUS_LABELS = {
  PENDING: 'Pending',
  CONTACTED: 'Contacted',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
}

const STATUS_FILTERS = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

const PAGE_SIZE = 10

export default function TripRequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [page, setPage] = useState(1)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    setError('')
    setPage(1)
    try {
      const params = new URLSearchParams()
      if (search.trim()) params.set('search', search.trim())
      if (status) params.set('status', status)
      const res = await fetch(`/api/admin/trip-requests?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load trip requests')
      setRequests(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load trip requests')
    } finally {
      setLoading(false)
    }
  }, [search, status])

  useEffect(() => {
    const timer = setTimeout(fetchRequests, 200)
    return () => clearTimeout(timer)
  }, [fetchRequests])

  const updateStatus = async (id, nextStatus) => {
    setError('')
    try {
      const res = await fetch(`/api/admin/trip-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: nextStatus } : r)))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update status')
    }
  }

  const deleteRequest = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trip request? This action cannot be undone.')) {
      return
    }
    setError('')
    try {
      const res = await fetch(`/api/admin/trip-requests/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete trip request')
      setRequests((prev) => prev.filter((r) => r.id !== id))
      setExpandedId((prev) => (prev === id ? null : prev))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete trip request')
    }
  }

  const formatDate = (iso) =>
    new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })

  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id))

  const counts = useMemo(() => {
    const total = requests.length
    const pending = requests.filter((r) => r.status === 'PENDING').length
    const contacted = requests.filter((r) => r.status === 'CONTACTED').length
    return { total, pending, contacted }
  }, [requests])

  const totalPages = Math.max(1, Math.ceil(requests.length / PAGE_SIZE))
  const pageRequests = requests.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const pageStart = requests.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const pageEnd = Math.min(page * PAGE_SIZE, requests.length)

  const goToPage = (next) => {
    if (next < 1 || next > totalPages) return
    setPage(next)
    setExpandedId(null)
  }

  return (
    <>
      <div className="admin-header">
        <h1>Trip Requests</h1>
        {!loading && requests.length > 0 && (
          <span className="cq-summary">
            {counts.total} shown · {counts.pending} pending · {counts.contacted} contacted
          </span>
        )}
      </div>

      <div className="cq-toolbar">
        <input
          type="search"
          className="cq-search"
          placeholder="Search by name, email, phone, destination…"
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
              <th>Destination</th>
              <th>Travelers</th>
              <th>Dates</th>
              <th>Phone</th>
              <th>Received</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="cq-empty">Loading trip requests…</td>
              </tr>
            ) : pageRequests.length === 0 ? (
              <tr>
                <td colSpan="8" className="cq-empty">No trip requests found.</td>
              </tr>
            ) : (
              pageRequests.map((r) => (
                <RequestRow
                  key={r.id}
                  request={r}
                  expanded={expandedId === r.id}
                  onToggle={() => toggleExpand(r.id)}
                  onStatusChange={updateStatus}
                  onDelete={deleteRequest}
                  formatDate={formatDate}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && requests.length > 0 && (
        <div className="admin-pagination__row">
          <span className="admin-pagination__info">Showing {pageStart}–{pageEnd} of {requests.length}</span>
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

function RequestRow({ request, expanded, onToggle, onStatusChange, onDelete, formatDate }) {
  const startDate = new Date(request.startDate).toLocaleDateString(undefined, { dateStyle: 'medium' })
  const endDate = new Date(request.endDate).toLocaleDateString(undefined, { dateStyle: 'medium' })

  return (
    <>
      <tr className={expanded ? 'cq-row cq-row--expanded' : 'cq-row'}>
        <td>{request.name}</td>
        <td><strong>{request.destination}</strong></td>
        <td>{request.travelers}</td>
        <td>{startDate} – {endDate}</td>
        <td>{request.phone || '—'}</td>
        <td>{formatDate(request.createdAt)}</td>
        <td>
          <select
            className={`cq-status cq-status--${request.status}`}
            value={request.status}
            onChange={(e) => onStatusChange(request.id, e.target.value)}
            aria-label={`Status for ${request.name}`}
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </td>
        <td>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button type="button" className="btn btn--outline btn--sm" onClick={onToggle}>
              {expanded ? 'Hide Details' : 'View Details'}
            </button>
            <button
              type="button"
              className="btn btn--danger btn--sm"
              onClick={() => onDelete(request.id)}
              title="Delete trip request"
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="cq-detail">
          <td colSpan="8">
            <div className="cq-detail__grid">
              <div>
                <strong>Name</strong>
                <p>{request.name}</p>
              </div>
              <div>
                <strong>Email</strong>
                <p>
                  <a href={`mailto:${request.email}`} className="cq-link">{request.email}</a>
                </p>
              </div>
              <div>
                <strong>Phone</strong>
                <p>
                  <a href={`tel:${request.phone}`} className="cq-link">{request.phone}</a>
                </p>
              </div>
              <div>
                <strong>Destination</strong>
                <p>{request.destination}</p>
              </div>
              <div>
                <strong>Travelers</strong>
                <p>{request.travelers}</p>
              </div>
              <div>
                <strong>Dates</strong>
                <p>{startDate} – {endDate}</p>
              </div>
              <div>
                <strong>Budget</strong>
                <p>{request.budget ? `PKR ${Number(request.budget).toLocaleString()}` : 'Not specified'}</p>
              </div>
              <div>
                <strong>Received</strong>
                <p>{formatDate(request.createdAt)}</p>
              </div>
            </div>
            {request.message && (
              <div className="cq-detail__message">
                <strong>Additional Details</strong>
                <p>{request.message}</p>
              </div>
            )}
            <div className="cq-detail__actions" style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <a
                href={`mailto:${request.email}?subject=Your trip to ${request.destination} — Pehchaan Travels&body=Hi ${request.name},%0A%0AThank you for your interest in visiting ${request.destination} with Pehchaan Travels.%0A%0AWe have received your trip request and would love to help plan your journey.%0A%0ABest regards,%0APehchaan Travels`}
                className="btn btn--primary btn--sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                Email Customer
              </a>
              <a
                href={`https://wa.me/${request.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${request.name},\n\nThank you for your interest in visiting ${request.destination} with Pehchaan Travels! We'd love to help plan your journey.\n\nBest regards,\nPehchaan Travels`)}`}
                className="btn btn--sm"
                style={{ backgroundColor: '#25d366', color: '#fff' }}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
