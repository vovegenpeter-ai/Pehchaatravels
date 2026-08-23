'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getTourPath, formatPrice } from '@/lib/tourUtils'
import { useCart } from '@/lib/CartContext'

export default function TourCard({ tour, dark }) {
  const { addItem } = useCart()
  const router = useRouter()
  const [adding, setAdding] = useState(false)

  const handleBookNow = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setAdding(true)
    addItem(tour)
    setTimeout(() => {
      setAdding(false)
      router.push('/cart')
    }, 400)
  }

  const duration = tour.duration || `${tour.days} Days`

  return (
    <article className={`card tour-card${dark ? ' card--dark' : ''}`}>
      <div className="card__image">
        <img src={tour.image} alt={tour.name} loading="lazy" />
      </div>
      <div className="card__body">
        <div className="card__title-row">
          <h3>{tour.name}</h3>
          <span className="card__duration">{duration}</span>
        </div>
        <p>{tour.description}</p>
        <div className="card__price-row">
          <span className="card__price-label">From</span>
          <span className="card__price-value">PKR {formatPrice(tour.price)}</span>
        </div>
        <button
          type="button"
          className="btn btn--primary btn--sm btn--full"
          onClick={handleBookNow}
          disabled={adding}
        >
          {adding ? 'Adding...' : 'Book Now'}
        </button>
      </div>
    </article>
  )
}
