import Link from 'next/link'
import { notFound } from 'next/navigation'
import HotelCard from '@/components/HotelCard'
import TourCard from '@/components/TourCard'
import { SectionHeader } from '@/components/UI'
import { getHotelBySlugOrId, getRelatedHotels } from '@/lib/db'

export const revalidate = 300

export async function generateMetadata({ params }) {
  const { slug } = await params
  const hotel = await getHotelBySlugOrId(slug)
  if (!hotel) return { title: 'Hotel Not Found — Pehchaan Travels' }
  return {
    title: `${hotel.name} — Pehchaan Travels`,
    description: hotel.shortDescription || hotel.description,
  }
}

export default async function HotelDetailPage({ params }) {
  const { slug } = await params
  const hotel = await getHotelBySlugOrId(slug)
  if (!hotel) notFound()

  const relatedHotels = await getRelatedHotels(hotel.id, 3)
  const roomTypes = Array.isArray(hotel.roomTypes) ? hotel.roomTypes : []

  return (
    <>
      <section className="tour-detail-hero" style={{ backgroundImage: `url(${hotel.image})` }}>
        <div className="tour-detail-hero__overlay">
          <div className="container">
            <h1>{hotel.name}</h1>
            <span className="tour-detail-hero__badge">★ {hotel.rating}</span>
          </div>
        </div>
      </section>

      <section className="section section--beige tour-info-section">
        <div className="container">
          <h2 className="tour-section-title">Hotel Information</h2>
          <div className="tour-info-grid">
            <div className="tour-info-item"><span className="tour-info-item__icon">📍</span><div><span className="tour-info-item__label">Location</span><span className="tour-info-item__value">{hotel.location}</span></div></div>
            <div className="tour-info-item"><span className="tour-info-item__icon">🏠</span><div><span className="tour-info-item__label">Address</span><span className="tour-info-item__value">{hotel.address || hotel.location}</span></div></div>
            <div className="tour-info-item"><span className="tour-info-item__icon">💰</span><div><span className="tour-info-item__label">Price per Night</span><span className="tour-info-item__value">PKR {hotel.pricePerNight.toLocaleString('en-US')}</span></div></div>
            <div className="tour-info-item"><span className="tour-info-item__icon">🕐</span><div><span className="tour-info-item__label">Check-in</span><span className="tour-info-item__value">{hotel.checkInTime || '2:00 PM'}</span></div></div>
            <div className="tour-info-item"><span className="tour-info-item__icon">🕐</span><div><span className="tour-info-item__label">Check-out</span><span className="tour-info-item__value">{hotel.checkOutTime || '12:00 PM'}</span></div></div>
            {hotel.contactPhone && (
              <div className="tour-info-item"><span className="tour-info-item__icon">📞</span><div><span className="tour-info-item__label">Contact</span><span className="tour-info-item__value">{hotel.contactPhone}</span></div></div>
            )}
          </div>
        </div>
      </section>

      <div className="container tour-detail-layout">
        <div className="tour-detail-content">
          <section className="tour-detail-block">
            <h2 className="tour-section-title">About This Hotel</h2>
            <div className="tour-description">
              {(hotel.fullDescription || hotel.description).split('\n\n').map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
            </div>
          </section>

          {hotel.amenities?.length > 0 && (
            <section className="tour-detail-block">
              <h2 className="tour-section-title">Amenities</h2>
              <ul className="tour-highlights">
                {hotel.amenities.map((a) => <li key={a}>{a}</li>)}
              </ul>
            </section>
          )}

          {roomTypes.length > 0 && (
            <section className="tour-detail-block">
              <h2 className="tour-section-title">Room Types</h2>
              <div className="grid grid--2">
                {roomTypes.map((room) => (
                  <article key={room.name} className="tour-detail-card">
                    <h3>{room.name}</h3>
                    {room.description && <p>{room.description}</p>}
                    <strong>PKR {Number(room.price).toLocaleString('en-US')}/night</strong>
                  </article>
                ))}
              </div>
            </section>
          )}

          {hotel.images?.length > 1 && (
            <section className="tour-detail-block">
              <h2 className="tour-section-title">Gallery</h2>
              <div className="grid grid--3">
                {hotel.images.map((img) => (
                  <img key={img} src={img} alt={hotel.name} style={{ borderRadius: 'var(--radius)', width: '100%', height: '200px', objectFit: 'cover' }} />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="tour-detail-sidebar">
          <div className="tour-detail-card">
            <div className="tour-detail-card__price">
              <span>From</span>
              <strong>PKR {hotel.pricePerNight.toLocaleString('en-US')}</strong>
              <small>per night</small>
            </div>
            <Link href={`/contact?hotel=${encodeURIComponent(hotel.name)}`} className="btn btn--primary btn--full">Book This Hotel</Link>
          </div>
        </aside>
      </div>

      {relatedHotels.length > 0 && (
        <section className="section section--beige">
          <div className="container">
            <SectionHeader title="Other Hotels" description="More comfortable stays you might like" />
            <div className="grid grid--3">
              {relatedHotels.map((h) => <HotelCard key={h.id} hotel={h} />)}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
