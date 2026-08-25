'use client'

import { useCallback, useEffect, useState } from 'react'

const STATUS_LABELS = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
}

const STATUS_COLORS = {
  pending: { bg: '#fef3c7', color: '#92400e' },
  approved: { bg: '#d1fae5', color: '#065f46' },
  rejected: { bg: '#fee2e2', color: '#991b1b' },
}

const STATUS_FILTERS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, averageRating: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (status) params.set('status', status)
      const res = await fetch(`/api/admin/reviews?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load reviews')
      const data = await res.json()
      setReviews(data.reviews)
      setStats(data.stats)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const updateStatus = async (id, newStatus) => {
    setUpdatingId(id)
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update review')
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)))
      // Update stats
      setStats((prev) => ({
        ...prev,
        pending: newStatus === 'pending' ? prev.pending + 1 : (prev.pending - 1),
        approved: newStatus === 'approved' ? prev.approved + 1 : (prev.approved - 1),
        rejected: newStatus === 'rejected' ? prev.rejected + 1 : (prev.rejected - 1),
      }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update review')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this review?')) return
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete review')
      setReviews((prev) => prev.filter((r) => r.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete review')
    }
  }

  const formatDate = (iso) =>
    new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })

  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id))

  return (
    <>
      <div className="admin-header">
        <h1>Reviews</h1>
      </div>

      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: '0.75rem', color: '#166534' }}>Total Reviews</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#14532d' }}>{stats.total}</div>
        </div>
        <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '8px', border: '1px solid #fcd34d' }}>
          <div style={{ fontSize: '0.75rem', color: '#92400e' }}>Pending</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#78350f' }}>{stats.pending}</div>
        </div>
        <div style={{ background: '#d1fae5', padding: '1rem', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
          <div style={{ fontSize: '0.75rem', color: '#065f46' }}>Approved</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#064e3b' }}>{stats.approved}</div>
        </div>
        <div style={{ background: '#fee2e2', padding: '1rem', borderRadius: '8px', border: '1px solid #fecaca' }}>
          <div style={{ fontSize: '0.75rem', color: '#991b1b' }}>Rejected</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#7f1d1d' }}>{stats.rejected}</div>
        </div>
        <div style={{ background: '#dbeafe', padding: '1rem', borderRadius: '8px', border: '1px solid #93c5fd' }}>
          <div style={{ fontSize: '0.75rem', color: '#1e40af' }}>Average Rating</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e3a8a' }}>★ {stats.averageRating}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="cq-toolbar">
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

      {/* Reviews Table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Tour</th>
              <th>Rating</th>
              <th>Review</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="cq-empty">Loading reviews...</td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan="7" className="cq-empty">No reviews found.</td>
              </tr>
            ) : (
              reviews.map((review) => (
                <ReviewRow
                  key={review.id}
                  review={review}
                  expanded={expandedId === review.id}
                  onToggle={() => toggleExpand(review.id)}
                  onStatusChange={updateStatus}
                  onDelete={handleDelete}
                  formatDate={formatDate}
                  updating={updatingId === review.id}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

function ReviewRow({ review, expanded, onToggle, onStatusChange, onDelete, formatDate, updating }) {
  const colors = STATUS_COLORS[review.status] || STATUS_COLORS.pending

  return (
    <>
      <tr className={expanded ? 'cq-row cq-row--expanded' : 'cq-row'}>
        <td>
          <div>
            <strong>{review.user.fullName}</strong>
            <div style={{ fontSize: '12px', color: '#718096' }}>{review.user.email}</div>
          </div>
        </td>
        <td style={{ fontSize: '13px' }}>{review.tour.name}</td>
        <td>
          <span style={{ color: '#f59e0b', fontSize: '14px' }}>
            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
          </span>
        </td>
        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px' }}>
          {review.comment}
        </td>
        <td style={{ fontSize: '13px' }}>{formatDate(review.createdAt)}</td>
        <td>
          <span style={{
            display: 'inline-block',
            padding: '2px 10px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 600,
            backgroundColor: colors.bg,
            color: colors.color,
          }}>
            {STATUS_LABELS[review.status]}
          </span>
        </td>
        <td>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn--outline btn--sm" onClick={onToggle} style={{ fontSize: '11px', padding: '4px 8px' }}>
              {expanded ? 'Hide' : 'View'}
            </button>
            {review.status === 'pending' && (
              <>
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  onClick={() => onStatusChange(review.id, 'approved')}
                  disabled={updating}
                  style={{ fontSize: '11px', padding: '4px 8px', background: '#16a34a' }}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="btn btn--sm"
                  onClick={() => onStatusChange(review.id, 'rejected')}
                  disabled={updating}
                  style={{ fontSize: '11px', padding: '4px 8px', background: '#dc2626', color: 'white' }}
                >
                  Reject
                </button>
              </>
            )}
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => onDelete(review.id)}
              style={{ fontSize: '11px', padding: '4px 8px', color: '#dc2626', borderColor: '#fecaca' }}
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="cq-detail">
          <td colSpan="7">
            <div className="cq-detail__grid">
              <div>
                <strong>Customer Name</strong>
                <p>{review.user.fullName}</p>
              </div>
              <div>
                <strong>Email</strong>
                <p>{review.user.email}</p>
              </div>
              <div>
                <strong>Tour</strong>
                <p>{review.tour.name}</p>
              </div>
              <div>
                <strong>Booking ID</strong>
                <p style={{ fontFamily: 'monospace', fontSize: '12px' }}>{review.orderId.slice(-8).toUpperCase()}</p>
              </div>
              <div>
                <strong>Rating</strong>
                <p style={{ color: '#f59e0b' }}>{'★'.repeat(review.rating)} ({review.rating}/5)</p>
              </div>
              <div>
                <strong>Date</strong>
                <p>{formatDate(review.createdAt)}</p>
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <strong>Review</strong>
              <p style={{ marginTop: '4px', padding: '12px', background: '#f7fafc', borderRadius: '8px', border: '1px solid #e2e8f0', lineHeight: 1.6 }}>
                {review.comment}
              </p>
            </div>
            {review.images && review.images.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <strong>Images</strong>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                  {review.images.map((img, idx) => (
                    <img key={idx} src={img} alt={`Review image ${idx + 1}`} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                  ))}
                </div>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  )
}
