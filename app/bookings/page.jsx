'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const STATUS_LABELS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
}

const STATUS_COLORS = {
  PENDING: { bg: '#fef3c7', color: '#92400e' },
  CONFIRMED: { bg: '#d1fae5', color: '#065f46' },
  CANCELLED: { bg: '#fee2e2', color: '#991b1b' },
  COMPLETED: { bg: '#dbeafe', color: '#1e40af' },
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchBookings() {
      try {
        const res = await fetch('/api/bookings')
        if (res.status === 401) {
          window.location.href = '/sign-in?redirect=/bookings'
          return
        }
        if (!res.ok) throw new Error('Failed to load bookings')
        setBookings(await res.json())
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load bookings')
      } finally {
        setLoading(false)
      }
    }
    fetchBookings()
  }, [])

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

  const formatDateTime = (iso) =>
    new Date(iso).toLocaleString('en-PK', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })

  return (
    <main style={{ minHeight: '70vh', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1a4d3e', marginBottom: '0.5rem' }}>
          My Bookings
        </h1>
        <p style={{ color: '#718096', marginBottom: '2rem' }}>
          View and track all your tour bookings with Pehchaan Travels.
        </p>

        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            background: '#fee2e2',
            color: '#991b1b',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
          }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
            Loading your bookings…
          </div>
        ) : bookings.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: '#f7fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
            <h2 style={{ fontSize: '1.25rem', color: '#1a4d3e', marginBottom: '0.5rem' }}>
              No bookings yet
            </h2>
            <p style={{ color: '#718096', marginBottom: '1.5rem' }}>
              You haven&apos;t made any bookings. Explore our tours and start your adventure!
            </p>
            <Link
              href="/tours"
              style={{
                display: 'inline-block',
                padding: '0.65rem 1.5rem',
                background: '#1a4d3e',
                color: '#fff',
                borderRadius: '8px',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'background 0.2s',
              }}
            >
              Explore Tours
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {bookings.map((booking) => {
              const colors = STATUS_COLORS[booking.status] || STATUS_COLORS.PENDING
              const shortId = booking.id.slice(-8).toUpperCase()
              return (
                <div
                  key={booking.id}
                  style={{
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'box-shadow 0.2s',
                  }}
                >
                  {/* Header row */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    padding: '1rem 1.25rem',
                    background: '#f7fafc',
                    borderBottom: '1px solid #e2e8f0',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <code style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: '#1a4d3e',
                        background: '#d1fae5',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                      }}>
                        #{shortId}
                      </code>
                      <span style={{ fontSize: '0.85rem', color: '#718096' }}>
                        Booked {formatDate(booking.createdAt)}
                      </span>
                    </div>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      background: colors.bg,
                      color: colors.color,
                    }}>
                      {STATUS_LABELS[booking.status]}
                    </span>
                  </div>

                  {/* Items */}
                  <div style={{ padding: '1rem 1.25rem' }}>
                    {booking.items.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          padding: '0.75rem 0',
                          borderBottom: '1px solid #f0f0f0',
                        }}
                      >
                        {item.tourImage && (
                          <img
                            src={item.tourImage}
                            alt={item.tourName}
                            style={{
                              width: '56px',
                              height: '56px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, color: '#1a4d3e', fontSize: '0.95rem' }}>
                            {item.tourName}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#718096', marginTop: '2px' }}>
                            Qty: {item.quantity} · PKR {Number(item.price).toLocaleString()} each
                          </div>
                        </div>
                        <div style={{ fontWeight: 700, color: '#1a4d3e', fontSize: '0.95rem', flexShrink: 0 }}>
                          PKR {(Number(item.price) * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    ))}

                    {/* Full Reference ID */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      paddingTop: '0.75rem',
                      marginTop: '0.25rem',
                      borderTop: '1px solid #f0f0f0',
                    }}>
                      <span style={{ fontSize: '0.85rem', color: '#718096' }}>
                        Order ID:
                      </span>
                      <code style={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#1a4d3e',
                        fontFamily: 'monospace',
                        wordBreak: 'break-all',
                      }}>
                        {booking.id}
                      </code>
                    </div>

                    {/* Total */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '0.75rem',
                      marginTop: '0.25rem',
                      borderTop: '2px solid #e2e8f0',
                    }}>
                      <span style={{ fontSize: '0.9rem', color: '#718096' }}>
                        Total Amount
                      </span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a4d3e' }}>
                        PKR {Number(booking.totalAmount).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
