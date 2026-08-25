'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

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

  useEffect(() => {
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

    fetchReviews()
  }, [])

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })

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
        return (
          <div key={review.id} style={{ padding: '1rem', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div>
                <Link href={`/tours/${review.tour.slug}`} style={{ fontWeight: 600, color: '#1a4d3e', textDecoration: 'none' }}>
                  {review.tour.name}
                </Link>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{formatDate(review.createdAt)}</div>
              </div>
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
            </div>
            <div style={{ color: '#f59e0b', marginBottom: '0.5rem' }}>
              {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
            </div>
            <p style={{ color: '#374151', fontSize: '14px', lineHeight: 1.5, margin: 0 }}>{review.comment}</p>
          </div>
        )
      })}
    </div>
  )
}
