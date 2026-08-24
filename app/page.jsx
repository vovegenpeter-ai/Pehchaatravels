import Link from 'next/link'
import TourCard from '@/components/TourCard'
import PlacesAndHotelsSection from '@/components/PlacesAndHotelsSection'
import { getFeaturedTours, getFeaturedDestinations, getFeaturedHotels } from '@/lib/db'
import { HERO_IMAGE, TRIP_IMAGE, defaultTours, popularPlaces, defaultHotels } from '@/lib/initialData'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let tours = []
  let places = []
  let hotels = []

  try {
    const dbTours = await getFeaturedTours(3)
    if (dbTours && dbTours.length >= 3) {
      tours = dbTours.slice(0, 3)
    } else {
      tours = defaultTours.slice(0, 3)
    }
  } catch {
    tours = defaultTours.slice(0, 3)
  }

  try {
    const dbPlaces = await getFeaturedDestinations(4)
    if (dbPlaces && dbPlaces.length >= 4) {
      places = dbPlaces.slice(0, 4)
    } else {
      places = popularPlaces.slice(0, 4)
    }
  } catch {
    places = popularPlaces.slice(0, 4)
  }

  try {
    const dbHotels = await getFeaturedHotels(4)
    if (dbHotels && dbHotels.length >= 4) {
      hotels = dbHotels.slice(0, 4)
    } else {
      hotels = defaultHotels.slice(0, 4)
    }
  } catch {
    hotels = defaultHotels.slice(0, 4)
  }

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

      {/* 3. Popular Places & Hotels Section */}
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
