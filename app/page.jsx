import Link from 'next/link'
import TourCard from '@/components/TourCard'
import PlacesAndHotelsSection from '@/components/PlacesAndHotelsSection'
import { getFeaturedTours, getFeaturedDestinations, getFeaturedHotels, getDestinationCategories } from '@/lib/db'
import { HERO_IMAGE, TRIP_IMAGE, defaultTours, popularPlaces, defaultHotels } from '@/lib/initialData'

export const revalidate = 60

export default async function HomePage() {
  let tours = []
  let places = []
  let hotels = []

  let categories = []

  const [dbTours, dbPlaces, dbHotels, dbCategories] = await Promise.allSettled([
    getFeaturedTours(3),
    getFeaturedDestinations(4),
    getFeaturedHotels(4),
    getDestinationCategories(),
  ])

  categories = dbCategories.status === 'fulfilled' ? dbCategories.value : []

  tours = dbTours.status === 'fulfilled' && dbTours.value?.length >= 3
    ? dbTours.value.slice(0, 3)
    : defaultTours.slice(0, 3)

  places = dbPlaces.status === 'fulfilled'
    ? dbPlaces.value.slice(0, 4)
    : []

  hotels = dbHotels.status === 'fulfilled' && dbHotels.value?.length >= 4
    ? dbHotels.value.slice(0, 4)
    : defaultHotels.slice(0, 4)

  return (
    <div className="home-page-ref">
      {/* 1. Hero Section */}
      <section className="hero-ref" style={{ backgroundImage: `url(${HERO_IMAGE})` }}>
        <div className="hero-ref__overlay">
          <div className="container hero-ref__container">
            <div className="hero-ref__content">
              <h1 className="hero-ref__title">
                Explore Pakistan,<br />Create Unforgettable<br />Memories
              </h1>
              <p className="hero-ref__subtitle">
                Discover the majestic peaks, vibrant culture, and breathtaking landscapes of Northern Pakistan with our expertly curated tours.
              </p>
              <div className="hero-ref__actions">
                <Link href="/tours" className="btn-ref btn-ref--primary">
                  Explore Tours
                </Link>
                <Link href="/make-my-trip" className="btn-ref btn-ref--outline">
                  Make My Trip
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Discover Our Best Tours Section */}
      <section className="best-tours-section" id="tours">
        <div className="container">
          <div className="best-tours-header">
            <div className="best-tours-header__text">
              <h2 className="best-tours-header__title">Discover Our Best Tours</h2>
              <p className="best-tours-header__subtitle">Handpicked experiences for the adventurous soul.</p>
            </div>
            <Link href="/tours" className="best-tours-header__link">
              View All <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="tour-cards-grid">
            {tours.map((tour) => (
              <TourCard key={tour.id || tour.slug} tour={tour} />
            ))}
          </div>
        </div>
      </section>

      {/* 3. Places Categories Section */}
      {categories.length > 0 && (
        <section className="home-places-section">
          <div className="container">
            <div className="best-tours-header">
              <div className="best-tours-header__text">
                <h2 className="best-tours-header__title">Explore Pakistan&apos;s Destinations</h2>
                <p className="best-tours-header__subtitle">Browse categories to discover hidden gems across the country.</p>
              </div>
              <Link href="/places" className="best-tours-header__link">
                View All Places <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="home-categories-grid">
              {categories.map((cat) => (
                <Link key={cat.id} href={`/places/${cat.slug}`} className="home-category-card">
                  <div className="home-category-card__image">
                    <img src={cat.image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80'} alt={cat.name} loading="lazy" />
                    <div className="home-category-card__badge">
                      {cat.destinationCount} {cat.destinationCount === 1 ? 'place' : 'places'}
                    </div>
                  </div>
                  <div className="home-category-card__body">
                    <h3 className="home-category-card__name">{cat.name}</h3>
                    {cat.description && (
                      <p className="home-category-card__desc">{cat.description}</p>
                    )}
                    <span className="home-category-card__cta">Explore →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Featured Hotels Section */}
      <PlacesAndHotelsSection places={places} hotels={hotels} />

      {/* 4. Make Your Own Trip Promotional Banner */}
      <section className="custom-trip-section">
        <div className="container">
          <div
            className="custom-trip-banner"
            style={{ backgroundImage: `url(${TRIP_IMAGE})` }}
          >
            <div className="custom-trip-banner__overlay">
              <div className="custom-trip-banner__content">
                <h2 className="custom-trip-banner__title">Make Your Own Trip</h2>
                <p className="custom-trip-banner__desc">
                  Don&apos;t want an off-the-shelf package? Tell us where you want to go, and our experts will craft a personalized itinerary just for you.
                </p>
                <Link href="/make-my-trip" className="btn-ref btn-ref--primary custom-trip-banner__btn">
                  Plan My Trip
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
