'use client'

import { useState } from 'react'
import { useCart } from '@/lib/CartContext'
import { formatPrice, TAX_RATE } from '@/lib/tourUtils'
import { startNavigation } from '@/components/NavigationLoader'

/**
 * Booking section on the tour detail page: clear Single Person /
 * Couple (2 Persons) price cards, live-selected price, and a prominent
 * Book Now button that carries the selection straight to checkout.
 * Shows only when the admin has set a Couple Price for the tour.
 */
export default function BookingTypeSelector({ tour }) {
  const { addItem } = useCart()
  const [bookingType, setBookingType] = useState('SINGLE')
  const [adding, setAdding] = useState(false)

  const singlePrice = Number(tour.price)
  const couplePrice = Number(tour.couplePrice)
  const selectedPrice = bookingType === 'COUPLE' ? couplePrice : singlePrice
  const selectedPersons = bookingType === 'COUPLE' ? 2 : 1

  /** Book Now → selection is stored in the cart, checkout shows the summary */
  const handleBookNow = () => {
    setAdding(true)
    addItem(tour, { bookingType })
    setTimeout(() => {
      setAdding(false)
      startNavigation()
      window.location.href = '/checkout'
    }, 400)
  }

  return (
    <div className="booking-type-selector">
      <span className="booking-type-selector__label">Select Package</span>

      <div className="booking-type-selector__options" role="radiogroup" aria-label="Booking package">
        <button
          type="button"
          role="radio"
          aria-checked={bookingType === 'SINGLE'}
          className={`booking-type-option${bookingType === 'SINGLE' ? ' booking-type-option--active' : ''}`}
          onClick={() => setBookingType('SINGLE')}
        >
          {bookingType === 'SINGLE' && <span className="booking-type-option__check">✓</span>}
          <span className="booking-type-option__name">Single Person</span>
          <span className="booking-type-option__price">PKR {formatPrice(singlePrice)}</span>
          <span className="booking-type-option__meta">1 person · per person price</span>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={bookingType === 'COUPLE'}
          className={`booking-type-option${bookingType === 'COUPLE' ? ' booking-type-option--active' : ''}`}
          onClick={() => setBookingType('COUPLE')}
        >
          {bookingType === 'COUPLE' && <span className="booking-type-option__check">✓</span>}
          <span className="booking-type-option__name">Couple (2 Persons)</span>
          <span className="booking-type-option__price">PKR {formatPrice(couplePrice)}</span>
          <span className="booking-type-option__meta">total price for 2 people</span>
        </button>
      </div>

      {/* Live-selected price */}
      <div className="booking-type-selector__selected">
        <span>Selected: {bookingType === 'COUPLE' ? 'Couple (2 Persons)' : 'Single Person'}</span>
        <strong>PKR {formatPrice(selectedPrice)}</strong>
      </div>

      <button
        type="button"
        className="btn btn--primary btn--full booking-type-selector__book-btn"
        onClick={handleBookNow}
        disabled={adding}
      >
        {adding ? 'Preparing Booking…' : 'Book Now'}
      </button>

      <p className="booking-type-selector__hint">
        {bookingType === 'COUPLE'
          ? 'You are booking for 2 persons at the couple rate.'
          : 'You are booking 1 person. Switch to Couple to book 2 people at the couple rate.'}
      </p>
    </div>
  )
}
