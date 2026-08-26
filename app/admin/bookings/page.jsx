'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

const STATUS_LABELS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
}

const STATUS_COLORS = {
  PENDING: { bg: '#fef3c7', color: '#92400e' },
  CONFIRMED: { bg: '#d1fae5', color: '#065f46' },
  CANCELLED: { bg: '#fee2e2', color: '#991b1b' },
  COMPLETED: { bg: '#dbeafe', color: '#1e40af' },
}

const STATUS_FILTERS = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'COMPLETED', label: 'Completed' },
]

const PAGE_SIZE = 10

export default function BookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [page, setPage] = useState(1)

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    setError('')
    setPage(1)
    try {
      const params = new URLSearchParams()
      if (search.trim()) params.set('search', search.trim())
      if (status) params.set('status', status)
      const res = await fetch(`/api/admin/bookings?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load bookings')
      setBookings(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }, [search, status])

  useEffect(() => {
    const timer = setTimeout(fetchBookings, 200)
    return () => clearTimeout(timer)
  }, [fetchBookings])

  const updateStatus = async (id, nextStatus) => {
    setError('')
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      const updated = await res.json()
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: nextStatus } : b)))
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
    const total = bookings.length
    const pending = bookings.filter((b) => b.status === 'PENDING').length
    const confirmed = bookings.filter((b) => b.status === 'CONFIRMED').length
    const completed = bookings.filter((b) => b.status === 'COMPLETED').length
    const revenue = bookings
      .filter((b) => b.status !== 'CANCELLED')
      .reduce((sum, b) => sum + Number(b.totalAmount), 0)
    return { total, pending, confirmed, completed, revenue }
  }, [bookings])

  const totalPages = Math.max(1, Math.ceil(bookings.length / PAGE_SIZE))
  const pageBookings = bookings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const pageStart = bookings.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const pageEnd = Math.min(page * PAGE_SIZE, bookings.length)

  const goToPage = (next) => {
    if (next < 1 || next > totalPages) return
    setPage(next)
    setExpandedId(null)
  }

  return (
    <>
      <div className="admin-header">
        <h1>Bookings</h1>
        {!loading && bookings.length > 0 && (
          <span className="cq-summary">
            {counts.total} shown · {counts.pending} pending · {counts.confirmed} confirmed · {counts.completed} completed · Revenue: PKR {counts.revenue.toLocaleString()}
          </span>
        )}
      </div>

      <div className="cq-toolbar">
        <input
          type="search"
          className="cq-search"
          placeholder="Search by name, email, phone, order ID, or tour…"
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
              <th>Order ID</th>
              <th>Customer</th>
              <th>Tour(s)</th>
              <th>Travelers</th>
              <th>Amount</th>
              <th>Booked</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="cq-empty">Loading bookings…</td>
              </tr>
            ) : pageBookings.length === 0 ? (
              <tr>
                <td colSpan="8" className="cq-empty">No bookings found.</td>
              </tr>
            ) : (
              pageBookings.map((b) => (
                <BookingRow
                  key={b.id}
                  booking={b}
                  expanded={expandedId === b.id}
                  onToggle={() => toggleExpand(b.id)}
                  onStatusChange={updateStatus}
                  formatDate={formatDate}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && bookings.length > 0 && (
        <div className="admin-pagination__row">
          <span className="admin-pagination__info">Showing {pageStart}–{pageEnd} of {bookings.length}</span>
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

function BookingRow({ booking, expanded, onToggle, onStatusChange, formatDate }) {
  const totalTravelers = booking.items.reduce((sum, item) => sum + item.quantity, 0)
  const shortId = booking.id.slice(-8).toUpperCase()
  const colors = STATUS_COLORS[booking.status] || STATUS_COLORS.PENDING

  return (
    <>
      <tr className={expanded ? 'cq-row cq-row--expanded' : 'cq-row'}>
        <td>
          <code style={{ fontSize: '12px', color: '#1a4d3e' }}>#{shortId}</code>
        </td>
        <td>
          <div>
            <strong>{booking.fullName}</strong>
            <div style={{ fontSize: '12px', color: '#718096' }}>{booking.email}</div>
          </div>
        </td>
        <td>
          {booking.items.map((item) => (
            <div key={item.id} style={{ fontSize: '13px', marginBottom: '2px' }}>
              {item.tourName} × {item.quantity}
            </div>
          ))}
        </td>
        <td>{totalTravelers}</td>
        <td><strong>PKR {Number(booking.totalAmount).toLocaleString()}</strong></td>
        <td style={{ fontSize: '13px' }}>{formatDate(booking.createdAt)}</td>
        <td>
          <select
            className={`cq-status cq-status--${booking.status}`}
            value={booking.status}
            onChange={(e) => onStatusChange(booking.id, e.target.value)}
            aria-label={`Status for booking ${shortId}`}
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </td>
        <td>
          <button type="button" className="btn btn--outline btn--sm" onClick={onToggle}>
            {expanded ? 'Hide' : 'Details'}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="cq-detail">
          <td colSpan="8">
            <div className="cq-detail__grid">
              <div>
                <strong>Order ID</strong>
                <p style={{ fontFamily: 'monospace', fontSize: '13px', color: '#1a4d3e', wordBreak: 'break-all' }}>{booking.id}</p>
              </div>
              <div>
                <strong>Customer Name</strong>
                <p>{booking.fullName}</p>
              </div>
              <div>
                <strong>Email</strong>
                <p>
                  <a href={`mailto:${booking.email}`} className="cq-link">{booking.email}</a>
                </p>
              </div>
              <div>
                <strong>Phone</strong>
                <p>
                  <a href={`tel:${booking.phone}`} className="cq-link">{booking.phone}</a>
                </p>
              </div>
              <div>
                <strong>Address</strong>
                <p>{[booking.address, booking.city].filter(Boolean).join(', ') || 'Not provided'}</p>
              </div>
              <div>
                <strong>Booking Date</strong>
                <p>{formatDate(booking.createdAt)}</p>
              </div>
              <div>
                <strong>Total Amount</strong>
                <p style={{ fontWeight: 700, color: '#1a4d3e' }}>PKR {Number(booking.totalAmount).toLocaleString()}</p>
              </div>
              <div>
                <strong>Payment Status</strong>
                <p>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    backgroundColor: colors.bg,
                    color: colors.color,
                  }}>
                    {STATUS_LABELS[booking.status]}
                  </span>
                </p>
              </div>
            </div>

            {/* Tour Details */}
            <div style={{ marginTop: '16px' }}>
              <strong>Tour Details</strong>
              <div style={{ marginTop: '8px', display: 'grid', gap: '8px' }}>
                {booking.items.map((item) => (
                  <div key={item.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px',
                    background: '#f7fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                  }}>
                    {item.tourImage && (
                      <img src={item.tourImage} alt={item.tourName} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{item.tourName}</div>
                      <div style={{ fontSize: '13px', color: '#718096' }}>
                        Qty: {item.quantity} · Unit Price: PKR {Number(item.price).toLocaleString()}
                      </div>
                    </div>
                    <div style={{ fontWeight: 600, color: '#1a4d3e' }}>
                      PKR {(Number(item.price) * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {booking.notes && (
              <div style={{ marginTop: '16px' }}>
                <strong>Customer Notes</strong>
                <p style={{ marginTop: '4px', padding: '8px 12px', background: '#f7fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  {booking.notes}
                </p>
              </div>
            )}

            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <a
                href={`mailto:${booking.email}?subject=Your booking — Order #${shortId} — Pehchaan Travels&body=Hi ${booking.fullName},%0A%0AThank you for booking with Pehchaan Travels. Your Order ID is ${booking.id}.%0A%0AOur team will contact you shortly.%0A%0ABest regards,%0APehchaan Travels`}
                className="btn btn--primary btn--sm"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0' }}
              >
                Email Customer
              </a>
              <a
                href={`https://wa.me/${booking.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${booking.fullName},\n\nThank you for booking with Pehchaan Travels! Your Order ID is ${shortId}.\n\nBest regards,\nPehchaan Travels`)}`}
                className="btn btn--sm"
                style={{ backgroundColor: '#25d366', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '0' }}
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
