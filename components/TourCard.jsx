'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getTourPath, formatPrice } from '@/lib/tourUtils'
import { useCart } from '@/lib/CartContext'

export default function TourCard({ tour }) {
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

  return (
    <article className="card tour-card">
      <div className="card__image">
        <img src={tour.image} alt={tour.name} loading="lazy" />
        <span className="card__badge card__badge--rating">★ {tour.rating}</span>
      </div>
      <div className="card__body">
        <span className="card__location">📍 {tour.destination}</span>
        <h3>{tour.name}</h3>
        <p>{tour.description}</p>
        <div className="card__footer">
          <span className="card__price">PKR {formatPrice(tour.price)}</span>
          <div className="card__actions">
            <Link href={getTourPath(tour)} className="btn btn--outline btn--sm">
              View
            </Link>
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={handleBookNow}
              disabled={adding}
            >
              {adding ? 'Adding...' : 'Book Now'}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
