import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import HotelCard from '@/components/HotelCard'
import TourCard from '@/components/TourCard'
import { SectionHeader } from '@/components/UI'
import Breadcrumbs from '@/components/seo/Breadcrumbs'
import JsonLd from '@/components/seo/JsonLd'
import ViewContentTracker from '@/components/seo/ViewContentTracker'
import { getHotelBySlugOrId, getRelatedHotels } from '@/lib/db'
import { cloudinaryImg } from '@/lib/cloudinaryUrl'
import { buildMetadata, absoluteUrl, stripHtml, BUSINESS } from '@/lib/seo'

export const revalidate = 60

export async function generateMetadata({ params }) {
  const { slug } = await params
  const hotel = await getHotelBySlugOrId(slug)
  if (!hotel) return { title: 'Hotel Not Found' }

  const blurb = stripHtml(
    hotel.shortDescription || hotel.fullDescription || hotel.description
  ).slice(0, 150)

  return buildMetadata({
    title: `${hotel.name} — ${hotel.location} Hotel`,
    description: `${blurb} PKR ${hotel.pricePerNight.toLocaleString('en-US')} per night in ${hotel.location}. Check-in times, amenities and booking.`,
    path: `/hotels/${hotel.slug}`,
    image: hotel.image,
    keywords: [
      `${hotel.name} ${hotel.location}`,
      `hotels in ${hotel.location}`,
      `${hotel.location} hotel booking`,
    ],
  })
}

export default async function HotelDetailPage({ params }) {
  const { slug } = await params
  const hotel = await getHotelBySlugOrId(slug)
  if (!hotel) notFound()

  /* Lookup also accepts a raw ID — normalise to the canonical slug URL. */
  if (hotel.slug && slug !== hotel.slug) {
    redirect(`/hotels/${hotel.slug}`)
  }

  const relatedHotels = await getRelatedHotels(hotel.id, 3)
  const roomTypes = Array.isArray(hotel.roomTypes) ? hotel.roomTypes : []

  const hotelUrl = `/hotels/${hotel.slug}`
  const breadcrumbItems = [
    { name: 'Home', path: '/' },
    { name: 'Hotels', path: '/hotels' },
    { name: hotel.name },
  ]

  /* Lodging markup uses only values stored in the database. No invented
     star ratings, amenities or review scores. */
  const hotelSchema = {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    name: hotel.name,
    description: stripHtml(hotel.shortDescription || hotel.description).slice(0, 600),
    url: absoluteUrl(hotelUrl),
    image: hotel.image,
    telephone: hotel.contactPhone || BUSINESS.telephone,
    email: hotel.contactEmail || BUSINESS.email,
    address: hotel.address
      ? { '@type': 'PostalAddress', streetAddress: hotel.address, addressLocality: hotel.location, addressCountry: 'PK' }
      : { '@type': 'PostalAddress', addressLocality: hotel.location, addressCountry: 'PK' },
    checkinTime: hotel.checkInTime || '14:00',
    checkoutTime: hotel.checkOutTime || '12:00',
    amenityFeature: (hotel.amenities || []).map((a) => ({
      '@type': 'LocationFeatureSpecification',
      name: a,
    })),
    offers: {
      '@type': 'Offer',
      price: Number(hotel.pricePerNight || 0),
      priceCurrency: 'PKR',
      url: absoluteUrl(hotelUrl),
      availability: 'https://schema.org/InStock',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        unitText: 'night',
        price: Number(hotel.pricePerNight || 0),
        priceCurrency: 'PKR',
      },
    },
    /* No aggregateRating: `rating` here is our own editorial score, not
       customer reviews, and Google requires AggregateRating to reflect real
       posted reviews. Leaving it out keeps the markup policy-compliant. */
  }

  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />
      <JsonLd data={hotelSchema} />
      <ViewContentTracker
        id={hotel.slug || hotel.id}
        name={hotel.name}
        type="hotel"
        category={hotel.location || 'Hotel'}
        city={hotel.location || undefined}
        value={Number(hotel.pricePerNight) || undefined}
        description={hotel.shortDescription || undefined}
      />
      <section className="tour-detail-hero" style={{ backgroundImage: `url(${cloudinaryImg(hotel.image, { width: 1600 })})` }}>
        <div className="tour-detail-hero__overlay">
          <div className="container">
            <h1>{hotel.name}</h1>
            {hotel.shortDescription && (
              <p className="tour-detail-hero__subtitle">{hotel.shortDescription}</p>
            )}
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
            <div className="tour-description" dangerouslySetInnerHTML={{ __html: hotel.fullDescription || hotel.description }} />
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
                  <img key={img} src={cloudinaryImg(img, { width: 800 })} alt={`${hotel.name} — ${hotel.location}`} loading="lazy" width="800" height="533" style={{ borderRadius: 'var(--radius)', width: '100%', height: '200px', objectFit: 'cover' }} />
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
