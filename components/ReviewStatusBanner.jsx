'use client'

import { useEffect, useState } from 'react'

export default function ReviewStatusBanner({ tourId }) {
  const [status, setStatus] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/reviews/eligibility?tourId=${tourId}`)
        const data = await res.json()
        if (!data.eligible && data.reason === 'Review already submitted' && data.reviewStatus) {
          setStatus(data.reviewStatus)
          setVisible(true)

          // Auto-dismiss after 5 seconds
          setTimeout(() => {
            setVisible(false)
          }, 5000)
        }
      } catch {
        // Silently fail
      }
    }

    checkStatus()
  }, [tourId])

  if (!visible || !status) return null

  const statusConfig = {
    pending: {
      bg: '#fef3c7',
      color: '#92400e',
      icon: '⏳',
      message: 'Review Submitted (Awaiting Approval)',
    },
    approved: {
      bg: '#d1fae5',
      color: '#065f46',
      icon: '✅',
      message: 'Review Published',
    },
    rejected: {
      bg: '#fee2e2',
      color: '#991b1b',
      icon: '❌',
      message: 'Review Rejected',
    },
  }

  const config = statusConfig[status] || statusConfig.pending

  return (
    <div
      style={{
        padding: '1rem 1.5rem',
        background: config.bg,
        color: config.color,
        borderRadius: '10px',
        textAlign: 'center',
        fontWeight: 600,
        fontSize: '15px',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        animation: 'fadeIn 0.3s ease-in-out',
      }}
    >
      <span style={{ fontSize: '1.2rem' }}>{config.icon}</span>
      {config.message}
    </div>
  )
}
