'use client'

import { useEffect, useState } from 'react'

export default function ReviewsList({ tourId }) {
  const [reviews, setReviews] = useState([])
  const [summary, setSummary] = useState({ averageRating: 0, totalReviews: 0, ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } })
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('recent')
  const [filterRating, setFilterRating] = useState('')

  useEffect(() => {
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

    fetchReviews()
  }, [tourId, sortBy, filterRating])

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div>
      {/* Rating Summary */}
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {/* Average Rating */}
        <div style={{ textAlign: 'center', minWidth: '150px' }}>
          <div style={{ fontSize: '3rem', fontWeight: 700, color: '#1a4d3e' }}>{summary.averageRating}</div>
          <div style={{ color: '#f59e0b', fontSize: '1.25rem' }}>{'★'.repeat(Math.round(summary.averageRating))}</div>
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

      {/* Reviews List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
          No reviews found. Be the first to review this tour!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reviews.map((review) => (
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
                    <div style={{ fontWeight: 600 }}>{review.user.fullName}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{formatDate(review.createdAt)}</div>
                  </div>
                </div>
                <span style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: '#d1fae5',
                  color: '#065f46',
                  fontWeight: 600,
                }}>
                  ✓ Verified Customer
                </span>
              </div>
              <div style={{ color: '#f59e0b', marginBottom: '0.5rem' }}>
                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
              </div>
              <p style={{ color: '#374151', lineHeight: 1.6, margin: 0 }}>{review.comment}</p>
              {review.images && review.images.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                  {review.images.map((img, idx) => (
                    <img key={idx} src={img} alt={`Review image ${idx + 1}`} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
