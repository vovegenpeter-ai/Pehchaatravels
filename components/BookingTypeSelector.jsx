'use client'

import { useState } from 'react'
import { useCart } from '@/lib/CartContext'
import { formatPrice } from '@/lib/tourUtils'
import { startNavigation } from '@/components/NavigationLoader'

/**
 * Single / Couple booking selector with a live-updating price.
 * Shows only when the admin has set a Couple Price for the tour.
 */
export default function BookingTypeSelector({ tour }) {
  const { addItem } = useCart()
  const [bookingType, setBookingType] = useState('SINGLE')
  const [adding, setAdding] = useState(false)

  const singlePrice = Number(tour.price)
  const couplePrice = Number(tour.couplePrice)
  const selectedPrice = bookingType === 'COUPLE' ? couplePrice : singlePrice

  const handleBook = () => {
    setAdding(true)
    addItem(tour, { bookingType })
    setTimeout(() => {
      setAdding(false)
      startNavigation()
      window.location.href = '/cart'
    }, 400)
  }

  return (
    <div className="booking-type-selector">
      <span className="booking-type-selector__label">Booking Type</span>
      <div className="booking-type-selector__options" role="radiogroup" aria-label="Booking type">
        <button
          type="button"
          role="radio"
          aria-checked={bookingType === 'SINGLE'}
          className={`booking-type-option${bookingType === 'SINGLE' ? ' booking-type-option--active' : ''}`}
          onClick={() => setBookingType('SINGLE')}
        >
          <span className="booking-type-option__name">Single</span>
          <span className="booking-type-option__price">PKR {formatPrice(singlePrice)}</span>
          <span className="booking-type-option__meta">per person</span>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={bookingType === 'COUPLE'}
          className={`booking-type-option${bookingType === 'COUPLE' ? ' booking-type-option--active' : ''}`}
          onClick={() => setBookingType('COUPLE')}
        >
          <span className="booking-type-option__name">Couple</span>
          <span className="booking-type-option__price">PKR {formatPrice(couplePrice)}</span>
          <span className="booking-type-option__meta">2 persons</span>
        </button>
      </div>
      <button
        type="button"
        className="btn btn--primary btn--full"
        onClick={handleBook}
        disabled={adding}
      >
        {adding ? 'Adding to Cart...' : `Book This Tour — PKR ${formatPrice(selectedPrice)}`}
      </button>
      <p className="booking-type-selector__hint">
        {bookingType === 'COUPLE'
          ? 'Couple booking covers 2 persons at the couple rate.'
          : 'Switch to Couple to book at the couple rate.'}
      </p>
    </div>
  )
}
