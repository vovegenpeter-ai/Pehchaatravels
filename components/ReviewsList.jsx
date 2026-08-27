'use client'

import { useEffect, useState } from 'react'
import { StarDisplay, StarInput } from './HalfStarRating'
import { useAuth } from '@/lib/AuthContext'

export default function ReviewsList({ tourId }) {
  const [reviews, setReviews] = useState([])
  const [summary, setSummary] = useState({ averageRating: 0, totalReviews: 0, ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } })
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('recent')
  const [filterRating, setFilterRating] = useState('')
  const { user: currentUser } = useAuth()
  const [editingId, setEditingId] = useState(null)
  const [editRating, setEditRating] = useState(0)
  const [editHoverRating, setEditHoverRating] = useState(0)
  const [editComment, setEditComment] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [successMsg, setSuccessMsg] = useState('')
  const [editError, setEditError] = useState('')

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ tourId, sortBy })
      if (filterRating) params.set('rating', filterRating)
      const res = await fetch(`/api/reviews?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setReviews(data.reviews)
        setSummary(data.summary)
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [tourId, sortBy, filterRating])

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
    setEditError('')
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: editRating, comment: editComment }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update review')
      }
      setEditingId(null)
      setSuccessMsg('Review updated successfully!')
      setTimeout(() => setSuccessMsg(''), 4000)
      await fetchReviews()
    } catch (e) {
      setEditError(e instanceof Error ? e.message : 'Failed to update review')
    } finally {
      setSaving(false)
    }
  }

  const deleteReview = async (id) => {
    if (!confirm('Are you sure you want to delete this review?')) return
    setDeletingId(id)
    setEditError('')
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete review')
      }
      setSuccessMsg('Review deleted successfully!')
      setTimeout(() => setSuccessMsg(''), 4000)
      await fetchReviews()
    } catch (e) {
      setEditError(e instanceof Error ? e.message : 'Failed to delete review')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      {/* Rating Summary */}
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {/* Average Rating */}
        <div style={{ textAlign: 'center', minWidth: '150px' }}>
          <div style={{ fontSize: '3rem', fontWeight: 700, color: '#1a4d3e' }}>{summary.averageRating}</div>
          <div style={{ marginTop: '0.25rem' }}><StarDisplay rating={summary.averageRating} size="1.25rem" /></div>
          <div style={{ color: '#6b7280', fontSize: '14px', marginTop: '0.25rem' }}>
            Based on {summary.totalReviews} review{summary.totalReviews !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Rating Distribution */}
        <div style={{ flex: 1, minWidth: '200px' }}>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = summary.ratingDistribution[star] || 0
            const percentage = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0
            return (
              <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{ width: '50px', fontSize: '14px', color: '#6b7280' }}>{star} Star</span>
                <div style={{ flex: 1, height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${percentage}%`, height: '100%', background: '#f59e0b', borderRadius: '4px' }} />
                </div>
                <span style={{ width: '40px', fontSize: '12px', color: '#6b7280', textAlign: 'right' }}>{Math.round(percentage)}%</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Sort and Filter */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }}
        >
          <option value="recent">Most Recent</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
        </select>
        <select
          value={filterRating}
          onChange={(e) => setFilterRating(e.target.value)}
          style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }}
        >
          <option value="">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
      </div>

      {/* Success/Error Messages */}
      {successMsg && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          background: '#d1fae5',
          color: '#065f46',
          fontWeight: 600,
          fontSize: '14px',
          marginBottom: '1rem',
        }}>
          ✅ {successMsg}
        </div>
      )}
      {editError && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          background: '#fee2e2',
          color: '#991b1b',
          fontWeight: 600,
          fontSize: '14px',
          marginBottom: '1rem',
        }}>
          ❌ {editError}
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
          No reviews found. Be the first to review this tour!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reviews.map((review) => {
            const isOwner = currentUser && currentUser.id === review.user.id
            const isEditing = editingId === review.id

            return (
              <div key={review.id} style={{ padding: '1.25rem', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {review.user.avatar ? (
                      <img src={review.user.avatar} alt={review.user.fullName} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1a4d3e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '14px' }}>
                        {review.user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                    )}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600 }}>{review.user.fullName}</span>
                        <span style={{
                          fontSize: '10px',
                          padding: '1px 6px',
                          borderRadius: '10px',
                          background: '#d1fae5',
                          color: '#065f46',
                          fontWeight: 600,
                        }}>
                          ✓ Verified Customer
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{formatDate(review.createdAt)}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isOwner && !isEditing && (
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
                          }}>
                          {deletingId === review.id ? '...' : 'Delete'}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600, fontSize: '13px' }}>Rating</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <StarInput value={editRating} onChange={setEditRating} size="1.5rem" />
                        {editRating > 0 && (
                          <span style={{ fontSize: '13px', color: '#6b7280' }}>{editRating.toFixed(1)}</span>
                        )}
                      </div>
                    </div>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        rows={3}
                        minLength={10}
                        maxLength={2000}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', resize: 'vertical' }}
                      />
                      <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '0.25rem' }}>{editComment.length}/2000 characters</p>
                    </div>
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
                        }}>
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
                        }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <StarDisplay rating={review.rating} size="1rem" showValue />
                    </div>
                    <p style={{ color: '#374151', lineHeight: 1.6, margin: 0 }}>{review.comment}</p>
                    {review.images && review.images.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                        {review.images.map((img, idx) => (
                          <img key={idx} src={img} alt={`Review image ${idx + 1}`} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
