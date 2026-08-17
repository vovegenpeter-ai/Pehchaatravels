import Link from 'next/link'
import { getHotelPath } from '@/lib/pathUtils'

export default function HotelCard({ hotel }) {
  return (
    <article className="card hotel-card">
      <div className="card__image">
        <img src={hotel.image} alt={hotel.name} loading="lazy" />
        <span className="card__badge card__badge--rating">★ {hotel.rating}</span>
      </div>
      <div className="card__body">
        <span className="card__location">📍 {hotel.location}</span>
        <h3>{hotel.name}</h3>
        <p>{hotel.description}</p>
        <div className="card__footer">
          <span className="card__price">PKR {hotel.pricePerNight.toLocaleString('en-US')}/night</span>
          <div className="card__actions">
            <Link href={getHotelPath(hotel)} className="btn btn--outline btn--sm">View Hotel</Link>
            <Link href="/contact" className="btn btn--primary btn--sm">Book Now</Link>
          </div>
        </div>
      </div>
    </article>
  )
}
