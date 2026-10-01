'use client'

import { useState } from 'react'
import { useCart } from '@/lib/CartContext'
import { startNavigation } from '@/components/NavigationLoader'

/** Book button for tours without a couple price — carries the tour to the cart. */
export default function BookTourButton({ tour }) {
  const { addItem } = useCart()
  const [adding, setAdding] = useState(false)

  const handleBook = () => {
    setAdding(true)
    addItem(tour, { bookingType: 'SINGLE' })
    setTimeout(() => {
      setAdding(false)
      startNavigation()
      window.location.href = '/cart'
    }, 400)
  }

  return (
    <button
      type="button"
      className="btn btn--primary btn--full"
      onClick={handleBook}
      disabled={adding}
    >
      {adding ? 'Adding to Cart...' : 'Book This Tour'}
    </button>
  )
}
