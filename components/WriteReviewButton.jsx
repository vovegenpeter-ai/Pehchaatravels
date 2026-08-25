'use client'

import { useEffect, useState } from 'react'
import ReviewForm from './ReviewForm'

export default function WriteReviewButton({ tourId }) {
  const [eligibility, setEligibility] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const checkEligibility = async () => {
      try {
        const res = await fetch(`/api/reviews/eligibility?tourId=${tourId}`)
        const data = await res.json()
        setEligibility(data)
      } catch (error) {
        console.error('Failed to check eligibility:', error)
        setEligibility({ eligible: false, reason: 'Failed to check eligibility' })
      } finally {
        setLoading(false)
      }
    }

    checkEligibility()
  }, [tourId])

  if (loading) {
    return null
  }

  // Already reviewed
  if (eligibility && !eligibility.eligible && eligibility.reason === 'Review already submitted') {
    const statusColors = {
      pending: { bg: '#fef3c7', color: '#92400e' },
      approved: { bg: '#d1fae5', color: '#065f46' },
      rejected: { bg: '#fee2e2', color: '#991b1b' },
    }
    const colors = statusColors[eligibility.reviewStatus] || statusColors.pending
    const statusLabels = {
      pending: 'Review Submitted (Awaiting Approval)',
      approved: 'Review Published',
      rejected: 'Review Rejected',
    }

    return (
      <div style={{
        padding: '1rem',
        background: colors.bg,
        color: colors.color,
        borderRadius: '8px',
        textAlign: 'center',
        fontWeight: 600,
      }}>
        {statusLabels[eligibility.reviewStatus] || 'Review Submitted'}
      </div>
    )
  }

  // Not eligible
  if (eligibility && !eligibility.eligible) {
    return null
  }

  // Show form
  if (showForm) {
    return <ReviewForm tourId={tourId} orderId={eligibility?.orders?.[0]?.id} onSuccess={() => setShowForm(false)} />
  }

  // Show button
  return (
    <button
      type="button"
      onClick={() => setShowForm(true)}
      style={{
        width: '100%',
        padding: '0.75rem 1.5rem',
        background: '#1a4d3e',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 600,
        cursor: 'pointer',
        fontSize: '14px',
      }}
    >
      ✍️ Write a Review
    </button>
  )
}
