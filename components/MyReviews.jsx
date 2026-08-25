'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { StarDisplay, StarInput } from './HalfStarRating'

const STATUS_LABELS = {
  pending: 'Awaiting Approval',
  approved: 'Published',
  rejected: 'Rejected',
}

const STATUS_COLORS = {
  pending: { bg: '#fef3c7', color: '#92400e' },
  approved: { bg: '#d1fae5', color: '#065f46' },
  rejected: { bg: '#fee2e2', color: '#991b1b' },
}

export default function MyReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editRating, setEditRating] = useState(0)
  const [editHoverRating, setEditHoverRating] = useState(0)
  const [editComment, setEditComment] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews/my-reviews')
      if (!res.ok) throw new Error('Failed to load reviews')
      setReviews(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })

  const startEditing = (review) => {
    setEditingId(review.id)
    setEditRating(review.rating)
    setEditComment(review.comment)
    setEditHoverRating(0)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditRating(0)
    setEditComment('')
  }

  const saveEdit = async (id) => {
    if (editRating === 0 || editComment.length < 10) return
    setSaving(true)
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: editRating, comment: editComment }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update review')
      }
      setEditingId(null)
      await fetchReviews()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update review')
    } finally {
      setSaving(false)
    }
  }

  const deleteReview = async (id) => {
    if (!confirm('Are you sure you want to delete this review?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete review')
      }
      await fetchReviews()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete review')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Loading your reviews...</div>
  }

  if (error) {
    return <div style={{ textAlign: 'center', padding: '2rem', color: '#dc2626' }}>{error}</div>
  }

  if (reviews.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
        <p>You haven&apos;t written any reviews yet.</p>
        <Link href="/tours" style={{ color: '#1a4d3e', fontWeight: 600 }}>
          Browse Tours →
        </Link>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {reviews.map((review) => {
        const statusColors = STATUS_COLORS[review.status] || STATUS_COLORS.pending
        const isEditing = editingId === review.id

        return (
          <div key={review.id} style={{ padding: '1rem', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div>
                <Link href={`/tours/${review.tour.slug}`} style={{ fontWeight: 600, color: '#1a4d3e', textDecoration: 'none' }}>
                  {review.tour.name}
                </Link>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{formatDate(review.createdAt)}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: statusColors.bg,
                  color: statusColors.color,
                  fontWeight: 600,
                }}>
                  {STATUS_LABELS[review.status]}
                </span>
                {!isEditing && (
                  <>
                    <button
                      type="button"
                      onClick={() => startEditing(review)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '12px',
                        background: '#fff',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: '#374151',
                        fontWeight: 500,
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteReview(review.id)}
                      disabled={deletingId === review.id}
                      style={{
                        padding: '4px 10px',
                        fontSize: '12px',
                        background: '#fff',
                        border: '1px solid #fca5a5',
                        borderRadius: '6px',
                        cursor: deletingId === review.id ? 'not-allowed' : 'pointer',
                        color: '#dc2626',
                        fontWeight: 500,
                        opacity: deletingId === review.id ? 0.6 : 1,
                      }}
                    >
                      {deletingId === review.id ? '...' : 'Delete'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {isEditing ? (
              <div style={{ marginTop: '0.75rem' }}>
                {/* Edit Rating */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600, fontSize: '13px' }}>Rating</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <StarInput value={editRating} onChange={setEditRating} size="1.5rem" />
                    {editRating > 0 && (
                      <span style={{ fontSize: '13px', color: '#6b7280' }}>{editRating.toFixed(1)}</span>
                    )}
                  </div>
                </div>

                {/* Edit Comment */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    rows={3}
                    minLength={10}
                    maxLength={2000}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', resize: 'vertical' }}
                  />
                  <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '0.25rem' }}>
                    {editComment.length}/2000 characters
                  </p>
                </div>

                {/* Save/Cancel */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => saveEdit(review.id)}
                    disabled={saving || editRating === 0 || editComment.length < 10}
                    style={{
                      padding: '6px 14px',
                      fontSize: '13px',
                      background: '#1a4d3e',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      opacity: saving || editRating === 0 || editComment.length < 10 ? 0.6 : 1,
                    }}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    disabled={saving}
                    style={{
                      padding: '6px 14px',
                      fontSize: '13px',
                      background: '#fff',
                      color: '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '0.5rem' }}>
                  <StarDisplay rating={review.rating} size="1rem" showValue />
                </div>
                <p style={{ color: '#374151', fontSize: '14px', lineHeight: 1.5, margin: 0 }}>{review.comment}</p>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
