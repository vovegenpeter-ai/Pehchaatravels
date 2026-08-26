'use client'

import { useEffect, useState } from 'react'
import ReviewForm from './ReviewForm'

export default function WriteReviewButton({ tourId }) {
  const [eligibility, setEligibility] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkEligibility = async () => {
      try {
        const res = await fetch(`/api/reviews/eligibility?tourId=${tourId}`)
        const data = await res.json()
        setEligibility(data)
        setIsLoggedIn(data.reason !== 'Not logged in')
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

  // Not logged in - show sign in prompt
  if (!isLoggedIn) {
    return (
      <div style={{
        padding: '1rem',
        background: '#f3f4f6',
        color: '#374151',
        borderRadius: '8px',
        textAlign: 'center',
        fontWeight: 500,
      }}>
        <a href="/sign-in" style={{ color: '#1a4d3e', fontWeight: 700, textDecoration: 'underline' }}>Sign in</a> to write a review.
      </div>
    )
  }

  // Already reviewed - status shown in banner at top
  if (eligibility && !eligibility.eligible && eligibility.reason === 'Review already submitted') {
    return null
  }

  // Show form
  if (showForm) {
    return <ReviewForm tourId={tourId} orderId={eligibility?.orders?.[0]?.id} onSuccess={() => setShowForm(false)} />
  }

  // Show button (for logged-in users, even without completed booking)
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
      Write a Review
    </button>
  )
}
