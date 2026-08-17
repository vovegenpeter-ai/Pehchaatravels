import Link from 'next/link'
import { getTourPath, formatPrice } from '@/lib/tourUtils'

export default function TourCard({ tour }) {
  return (
    <article className="card tour-card">
      <div className="card__image">
        <img src={tour.image} alt={tour.name} loading="lazy" />
        <span className="card__badge">{tour.days} Days</span>
      </div>
      <div className="card__body">
        <div className="card__meta">
          <span className="card__location">📍 {tour.destination}</span>
          <span className="card__rating">★ {tour.rating}</span>
        </div>
        <h3>{tour.name}</h3>
        <p>{tour.description}</p>
        <div className="card__footer">
          <span className="card__price">From PKR {formatPrice(tour.price)}</span>
          <div className="card__actions">
            <Link href={getTourPath(tour)} className="btn btn--outline btn--sm">View Details</Link>
            <Link href={`/contact?tour=${encodeURIComponent(tour.name)}`} className="btn btn--primary btn--sm">Book Now</Link>
          </div>
        </div>
      </div>
    </article>
  )
}
