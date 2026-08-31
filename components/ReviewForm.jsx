'use client'

import { useState } from 'react'
import { StarInput } from './HalfStarRating'

export default function ReviewForm({ tourId, orderId, onSuccess }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    if (comment.length < 10) {
      setError('Review must be at least 10 characters')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tourId, orderId, rating, comment }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review')
      }

      setSuccess(data.message)
      setRating(0)
      setComment('')
      if (onSuccess) onSuccess()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="review-form__success">
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✓</div>
        <h3 style={{ color: '#065f46', marginBottom: '0.5rem' }}>Thank You!</h3>
        <p style={{ color: '#047857' }}>{success}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <h3 className="review-form__title">Write a Review</h3>

      {error && (
        <div className="review-form__error">{error}</div>
      )}

      {/* Star Rating */}
      <div className="review-form__field">
        <label className="review-form__label">Rating *</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <StarInput value={rating} onChange={setRating} size="2rem" />
          {rating > 0 && (
            <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>
              {rating.toFixed(1)} / 5.0
            </span>
          )}
        </div>
        <p className="review-form__hint">
          Click left side of star for half (e.g., 3.5) or right side for full (e.g., 4.0)
        </p>
      </div>

      {/* Comment */}
      <div className="review-form__field">
        <label htmlFor="review-comment" className="review-form__label">Your Review *</label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us about your experience..."
          rows={4}
          minLength={10}
          maxLength={2000}
          required
          className="review-form__textarea"
        />
        <p className="review-form__hint">
          {comment.length}/2000 characters (minimum 10)
        </p>
      </div>

      <button
        type="submit"
        disabled={submitting || rating === 0 || comment.length < 10}
        className="review-form__submit"
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}
