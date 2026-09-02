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
    }, 300)
  }

  const rating = tour.rating ? Number(tour.rating).toFixed(1) : '5.0'
  const displayPrice = tour.currency
    ? `${tour.currency}${formatPrice(tour.price)}`
    : tour.price < 5000
      ? `$${formatPrice(tour.price)}`
      : `PKR ${formatPrice(tour.price)}`

  const tourUrl = getTourPath(tour)

  return (
    <article className={`tour-card-ref ${dark ? 'tour-card-ref--dark' : ''}`}>
      <Link href={tourUrl} className="tour-card-ref__image-wrap" tabIndex={-1}>
        <img
          src={tour.image || tour.bannerImage}
          alt={tour.name}
          loading="lazy"
          className="tour-card-ref__image"
        />
        <div className="tour-card-ref__rating">
          <span className="tour-card-ref__star">★</span>
          <span>{rating}</span>
        </div>
      </Link>

      <div className="tour-card-ref__body">
        <div className="tour-card-ref__header">
          <h3 className="tour-card-ref__title">
            <Link href={tourUrl}>{tour.name}</Link>
          </h3>
        </div>

        <p className="tour-card-ref__desc">{tour.description || tour.shortDescription}</p>

        <div className="tour-card-ref__divider" />

        <div className="tour-card-ref__footer">
          <div className="tour-card-ref__price-wrap">
            <span className="tour-card-ref__price-label">From</span>
            <span className="tour-card-ref__price-value">{displayPrice}</span>
          </div>

          <button
            type="button"
            className="tour-card-ref__btn"
            onClick={handleBookNow}
            disabled={adding}
            aria-label={`Book ${tour.name}`}
          >
            {adding ? 'Adding...' : 'Book Now'}
          </button>
        </div>
      </div>
    </article>
  )
}

