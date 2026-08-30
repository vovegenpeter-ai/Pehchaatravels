import Link from 'next/link'
import { notFound } from 'next/navigation'
import TourCard from '@/components/TourCard'
import HotelCard from '@/components/HotelCard'
import { getDestinationBySlug, getRelatedDestinations } from '@/lib/db'

export const revalidate = 300

export async function generateMetadata({ params }) {
  const { slug } = await params
  const destination = await getDestinationBySlug(slug)
  if (!destination) return { title: 'Destination Not Found — Pehchaan Travels' }
  return {
    title: `${destination.name} — Pehchaan Travels`,
    description: destination.shortDescription || destination.description,
  }
}

export default async function DestinationDetailPage({ params }) {
  const { slug } = await params
  const destination = await getDestinationBySlug(slug)
  if (!destination) notFound()

  const related = await getRelatedDestinations(destination.id, 4, destination.categoryId)

  return (
    <>
      {/* Hero Section */}
      <section
        className="place-detail-hero"
        style={{ backgroundImage: `url(${destination.image})` }}
      >
        <div className="place-detail-hero__overlay">
          <div className="container">
              <h1 className="place-detail-hero__title">{destination.name}</h1>
            {destination.shortDescription && (
              <p className="place-detail-hero__subtitle">{destination.shortDescription}</p>
            )}
            <div className="place-detail-hero__meta">
              <span className="place-detail-hero__meta-item">
                📍 {destination.location}
              </span>
              {destination.featured && (
                <span className="place-detail-hero__meta-item place-detail-hero__meta-item--featured">
                  ⭐ Featured
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section place-detail-content">
        <div className="container">
          <div className="place-detail-layout">
            {/* Left: Description */}
            <div className="place-detail-main">
              <div className="place-detail-section">
                <h2 className="place-detail-section__title">About {destination.name}</h2>
                <div
                  className="place-detail-description"
                  dangerouslySetInnerHTML={{
                    __html: destination.fullDescription || destination.description
                  }}
                />
              </div>
            </div>

            {/* Right: Sidebar */}
            <aside className="place-detail-sidebar">
              {/* Location Card */}
              <div className="place-detail-card">
                <h3 className="place-detail-card__title">📍 Location</h3>
                <p className="place-detail-card__text">{destination.location}</p>
              </div>

              {/* Quick Facts */}
              <div className="place-detail-card">
                <h3 className="place-detail-card__title">ℹ️ Quick Facts</h3>
                <ul className="place-detail-card__list">
                  <li>
                    <span className="place-detail-card__label">Status</span>
                    <span className="place-detail-card__value">
                      {destination.published ? '✅ Published' : '📝 Draft'}
                    </span>
                  </li>
                  {destination.featured && (
                    <li>
                      <span className="place-detail-card__label">Featured</span>
                      <span className="place-detail-card__value">⭐ Yes</span>
                    </li>
                  )}
                </ul>
              </div>

              {/* Related Tours CTA */}
              {destination.tours?.length > 0 && (
                <div className="place-detail-card place-detail-card--green">
                  <h3 className="place-detail-card__title">🎯 Available Tours</h3>
                  <p className="place-detail-card__text">
                    {destination.tours.length} tour{destination.tours.length !== 1 ? 's' : ''} available
                  </p>
                  <Link href="/tours" className="btn btn--primary btn--sm btn--full">
                    View All Tours
                  </Link>
                </div>
              )}

              {/* Related Hotels CTA */}
              {destination.hotels?.length > 0 && (
                <div className="place-detail-card place-detail-card--blue">
                  <h3 className="place-detail-card__title">🏨 Nearby Hotels</h3>
                  <p className="place-detail-card__text">
                    {destination.hotels.length} hotel{destination.hotels.length !== 1 ? 's' : ''} available
                  </p>
                  <Link href="/hotels" className="btn btn--primary btn--sm btn--full">
                    View All Hotels
                  </Link>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      {/* Tours Section */}
      {destination.tours?.length > 0 && (
        <section className="section place-detail-tours">
          <div className="container">
            <div className="places-section-header">
              <h2 className="places-section-header__title">
                Tours in {destination.name}
              </h2>
              <p className="places-section-header__subtitle">
                Explore curated tour packages for this destination
              </p>
            </div>
            <div className="grid grid--3">
              {destination.tours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Hotels Section */}
      {destination.hotels?.length > 0 && (
        <section className="section place-detail-hotels">
          <div className="container">
            <div className="places-section-header">
              <h2 className="places-section-header__title">
                Hotels in {destination.name}
              </h2>
              <p className="places-section-header__subtitle">
                Comfortable stays in this region
              </p>
            </div>
            <div className="grid grid--3">
              {destination.hotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related Destinations */}
      {related.length > 0 && (
        <section className="section place-detail-related">
          <div className="container">
            <div className="places-section-header">
              <h2 className="places-section-header__title">Related Places</h2>
              <p className="places-section-header__subtitle">
                Explore more places in the same category
              </p>
            </div>
            <div className="grid grid--4">
              {related.map((place) => (
                <Link
                  key={place.id}
                  href={`/destinations/${place.slug}`}
                  className="places-related-card"
                >
                  <div className="places-related-card__image">
                    <img src={place.image} alt={place.name} loading="lazy" />
                  </div>
                  <div className="places-related-card__body">
                    <h3 className="places-related-card__name">{place.name}</h3>
                    <p className="places-related-card__desc">
                      {place.shortDescription || place.description}
                    </p>
                    <span className="places-related-card__cta">Explore →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
