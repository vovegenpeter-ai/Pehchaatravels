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
      <div style={{ padding: '1.5rem', background: '#d1fae5', borderRadius: '12px', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✓</div>
        <h3 style={{ color: '#065f46', marginBottom: '0.5rem' }}>Thank You!</h3>
        <p style={{ color: '#047857' }}>{success}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
      <h3 style={{ marginBottom: '1rem', color: '#1a4d3e' }}>Write a Review</h3>

      {error && (
        <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '1rem', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {/* Star Rating */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '14px' }}>Rating *</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <StarInput value={rating} onChange={setRating} size="2rem" />
          {rating > 0 && (
            <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>
              {rating.toFixed(1)} / 5.0
            </span>
          )}
        </div>
        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '0.25rem' }}>
          Click left side of star for half (e.g., 3.5) or right side for full (e.g., 4.0)
        </p>
      </div>

      {/* Comment */}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="review-comment" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '14px' }}>Your Review *</label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us about your experience..."
          rows={4}
          minLength={10}
          maxLength={2000}
          required
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', resize: 'vertical' }}
        />
        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '0.25rem' }}>
          {comment.length}/2000 characters (minimum 10)
        </p>
      </div>

      <button
        type="submit"
        disabled={submitting || rating === 0 || comment.length < 10}
        style={{
          padding: '0.75rem 1.5rem',
          background: '#1a4d3e',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 600,
          cursor: submitting ? 'not-allowed' : 'pointer',
          opacity: submitting || rating === 0 || comment.length < 10 ? 0.6 : 1,
        }}
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}
