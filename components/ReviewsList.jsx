'use client'

import { useEffect, useState } from 'react'
import { StarDisplay, StarInput } from './HalfStarRating'
import { useAuth } from '@/lib/AuthContext'
import ConfirmDialog from '@/components/admin/ConfirmDialog'

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
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

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
      <div className="review-summary">
        {/* Average Rating */}
        <div className="review-summary__avg">
          <div className="review-summary__avg-number">{summary.averageRating}</div>
          <div style={{ marginTop: '0.25rem' }}><StarDisplay rating={summary.averageRating} size="1.25rem" /></div>
          <div className="review-summary__avg-label">
            Based on {summary.totalReviews} review{summary.totalReviews !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="review-summary__bars">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = summary.ratingDistribution[star] || 0
            const percentage = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0
            return (
              <div key={star} className="review-summary__bar-row">
                <span className="review-summary__bar-label">{star} Star</span>
                <div className="review-summary__bar-track">
                  <div className="review-summary__bar-fill" style={{ width: `${percentage}%` }} />
                </div>
                <span className="review-summary__bar-pct">{Math.round(percentage)}%</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Sort and Filter */}
      <div className="review-toolbar">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="recent">Most Recent</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
        </select>
        <select
          value={filterRating}
          onChange={(e) => setFilterRating(e.target.value)}
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
        <div className="review-alert review-alert--success">
          ✅ {successMsg}
        </div>
      )}
      {editError && (
        <div className="review-alert review-alert--error">
          ❌ {editError}
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', gap: '0.75rem' }}>
          <div className="page-spinner page-spinner--sm" />
          <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Loading reviews…</span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="review-empty">
          No reviews found. Be the first to review this tour!
        </div>
      ) : (
        <div className="review-list">
          {reviews.map((review) => {
            const isOwner = currentUser && currentUser.id === review.user.id
            const isEditing = editingId === review.id

            return (
              <div key={review.id} className="review-card">
                <div className="review-card__header">
                  <div className="review-card__user">
                    {review.user.avatar ? (
                      <img src={review.user.avatar} alt={review.user.fullName} className="review-card__avatar" />
                    ) : (
                      <div className="review-card__avatar-placeholder">
                        {review.user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                    )}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span className="review-card__name">{review.user.fullName}</span>
                        <span className="review-card__badge">✓ Verified Customer</span>
                      </div>
                      <div className="review-card__date">{formatDate(review.createdAt)}</div>
                    </div>
                  </div>
                  <div className="review-card__actions">
                    {isOwner && !isEditing && (
                      <>
                        <button
                          type="button"
                          onClick={() => startEditing(review)}
                          className="review-card__edit-btn"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(review.id)}
                          disabled={deletingId === review.id}
                          className="review-card__delete-btn"
                        >
                          {deletingId === review.id ? '...' : 'Delete'}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="review-edit">
                    <div className="review-form__field">
                      <label className="review-form__label">Rating</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <StarInput value={editRating} onChange={setEditRating} size="1.5rem" />
                        {editRating > 0 && (
                          <span style={{ fontSize: '13px', color: '#6b7280' }}>{editRating.toFixed(1)}</span>
                        )}
                      </div>
                    </div>
                    <div className="review-form__field">
                      <textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        rows={3}
                        minLength={10}
                        maxLength={2000}
                        className="review-edit__input"
                      />
                      <p className="review-form__hint">{editComment.length}/2000 characters</p>
                    </div>
                    <div className="review-edit__row">
                      <button
                        type="button"
                        onClick={() => saveEdit(review.id)}
                        disabled={saving || editRating === 0 || editComment.length < 10}
                        className="review-edit__save"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditing}
                        disabled={saving}
                        className="review-edit__cancel"
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
                    <p className="review-card__comment">{review.comment}</p>
                    {review.images && review.images.length > 0 && (
                      <div className="review-card__images">
                        {review.images.map((img, idx) => (
                          <img key={idx} src={img} alt={`Review image ${idx + 1}`} className="review-card__image" />
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => {
          const id = confirmDeleteId
          setConfirmDeleteId(null)
          deleteReview(id)
        }}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  )
}
