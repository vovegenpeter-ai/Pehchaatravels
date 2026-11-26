import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import TourCard from '@/components/TourCard'
import HotelCard from '@/components/HotelCard'
import Breadcrumbs from '@/components/seo/Breadcrumbs'
import DescriptionLightbox from '@/components/DescriptionLightbox'
import ViewContentTracker from '@/components/seo/ViewContentTracker'
import { getDestinationBySlug, getRelatedDestinations } from '@/lib/db'
import { cloudinaryImg } from '@/lib/cloudinaryUrl'
import { buildMetadata, stripHtml } from '@/lib/seo'

export const revalidate = 60

export async function generateMetadata({ params }) {
  const { slug } = await params
  const destination = await getDestinationBySlug(slug)
  if (!destination) return { title: 'Destination Not Found' }

  const blurb = stripHtml(
    destination.shortDescription || destination.fullDescription || destination.description
  ).slice(0, 150)

  return buildMetadata({
    title: `${destination.name} — Places to Visit, Tours & Hotels`,
    description: `${blurb} See the tour packages and hotels available in ${destination.name}.`,
    path: `/destinations/${destination.slug}`,
    image: destination.image,
    keywords: [
      `${destination.name} Pakistan`,
      `${destination.name} tourist places`,
      `${destination.name} tour package`,
      `things to do in ${destination.name}`,
    ],
  })
}

export default async function DestinationDetailPage({ params }) {
  const { slug } = await params
  const destination = await getDestinationBySlug(slug)
  if (!destination) notFound()

  /* Lookup also accepts a raw ID — normalise to the canonical slug URL. */
  if (destination.slug && slug !== destination.slug) {
    redirect(`/destinations/${destination.slug}`)
  }

  const related = await getRelatedDestinations(destination.id, 4, destination.categoryId)

  const breadcrumbItems = [
    { name: 'Home', path: '/' },
    { name: 'Places', path: '/places' },
    { name: destination.name },
  ]

  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />
      <ViewContentTracker
        id={destination.slug || destination.id}
        name={destination.name}
        type="destination"
        category="Destination"
        city={destination.name}
        region={destination.location || undefined}
        description={destination.shortDescription || undefined}
      />
      {/* Hero Section */}
      <section
        className="place-detail-hero"
        style={{ backgroundImage: `url(${cloudinaryImg(destination.image, { width: 1600 })})` }}
      >
        <div className="place-detail-hero__overlay">
          <div className="container">
              <h1 className="place-detail-hero__title">{destination.name}</h1>
            {destination.shortDescription && (
              <p className="place-detail-hero__subtitle">{destination.shortDescription}</p>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section place-detail-content">
        <div className="container">
          <div className={`place-detail-layout${destination.tours?.length > 0 || destination.hotels?.length > 0 ? '' : ' place-detail-layout--full'}`}>
            {/* Left: Description */}
            <div className="place-detail-main">
              <div className="place-detail-section">
                <h2 className="place-detail-section__title">About {destination.name}</h2>
                <DescriptionLightbox
                  className="place-detail-description"
                  html={destination.fullDescription || destination.description}
                />
              </div>
            </div>

            {/* Right: Sidebar */}
            {(destination.tours?.length > 0 || destination.hotels?.length > 0) && (
            <aside className="place-detail-sidebar">
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
            )}
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
            <div className="grid grid--3">
              {related.map((place) => (
                <Link
                  key={place.id}
                  href={`/destinations/${place.slug}`}
                  className="places-related-card"
                >
                  <div className="places-related-card__image">
                    <img src={cloudinaryImg(place.image, { width: 600 })} alt={`${place.name} — places to visit and tours`} loading="lazy" width="600" height="400" />
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
