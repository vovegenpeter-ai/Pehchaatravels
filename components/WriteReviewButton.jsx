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

  // Not logged in — show sign-in prompt with button
  if (!isLoggedIn) {
    return (
      <div className="review-signin-prompt">
        <p className="review-signin-prompt__text">
          Sign in to share your experience and help other travelers.
        </p>
        <a href="/sign-in" className="review-signin-prompt__btn">
          Sign In to Write a Review
        </a>
      </div>
    )
  }

  // Already reviewed — status shown in banner at top
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
      className="review-write-btn"
    >
      Write a Review
    </button>
  )
}
