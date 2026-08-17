import Link from 'next/link'
import { SectionHeader } from '@/components/UI'
import TourCard from '@/components/TourCard'
import PlaceCard from '@/components/PlaceCard'
import HotelCard from '@/components/HotelCard'
import FeatureCard from '@/components/FeatureCard'
import ReviewCard from '@/components/ReviewCard'
import {
  getFeaturedTours,
  getPopularTours,
  getLatestTours,
  getFeaturedHotels,
  getFeaturedDestinations,
  getPublishedCategories,
  getFeaturedTestimonials,
} from '@/lib/db'
import { HERO_IMAGE, TRIP_IMAGE, features } from '@/lib/initialData'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // Run queries sequentially: the local dev database (Prisma PGlite) crashes
  // when relation queries run concurrently, so we avoid Promise.all here.
  const featuredTours = await getFeaturedTours(6)
  const popularTours = await getPopularTours(6)
  const latestTours = await getLatestTours(6)
  const featuredHotels = await getFeaturedHotels(6)
  const destinations = await getFeaturedDestinations(8)
  const categories = await getPublishedCategories()
  const testimonials = await getFeaturedTestimonials(6)

  return (
    <>
      <section className="hero" style={{ backgroundImage: `url(${HERO_IMAGE})` }}>
        <div className="hero__overlay">
          <div className="container hero__content">
            <h1>Explore Pakistan, Create Unforgettable Memories</h1>
            <p>
              Discover breathtaking destinations, exciting tours, comfortable stays, and
              unforgettable experiences with Pehchaan Travels.
            </p>
            <div className="hero__actions">
              <Link href="/tours" className="btn btn--primary btn--lg">Explore Tours</Link>
              <Link href="/make-my-trip" className="btn btn--outline-light btn--lg">Make My Trip</Link>
            </div>
          </div>
        </div>
      </section>

      {featuredTours.length > 0 && (
        <section className="section section--beige" id="tours">
          <div className="container">
            <SectionHeader
              title="Popular Visiting Places"
              description="Handpicked adventures across Pakistan's most stunning landscapes."
            />
            <div className="grid grid--3">
              {featuredTours.map((tour) => <TourCard key={tour.id} tour={tour} />)}
            </div>
          </div>
        </section>
      )}

      {popularTours.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHeader title="Popular Tours" description="Our most loved tour packages by travelers." />
            <div className="grid grid--3">
              {popularTours.map((tour) => <TourCard key={tour.id} tour={tour} />)}
            </div>
          </div>
        </section>
      )}

      {latestTours.length > 0 && (
        <section className="section section--beige">
          <div className="container">
            <SectionHeader title="Latest Tours" description="Freshly added packages for your next adventure." />
            <div className="grid grid--3">
              {latestTours.map((tour) => <TourCard key={tour.id} tour={tour} />)}
            </div>
          </div>
        </section>
      )}

      {destinations.length > 0 && (
        <section className="section" id="places">
          <div className="container">
            <SectionHeader
              title="Popular Destinations"
              description="From snow-capped peaks to lush valleys — discover Pakistan's most iconic destinations."
            />
            <div className="grid grid--4">
              {destinations.map((place) => <PlaceCard key={place.id} place={place} />)}
            </div>
          </div>
        </section>
      )}

      {featuredHotels.length > 0 && (
        <section className="section section--beige" id="hotels">
          <div className="container">
            <SectionHeader
              title="Featured Hotels"
              description="Comfortable, handpicked accommodations to rest and recharge after your adventures."
            />
            <div className="grid grid--3">
              {featuredHotels.map((hotel) => <HotelCard key={hotel.id} hotel={hotel} />)}
            </div>
          </div>
        </section>
      )}

      {categories.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHeader title="Browse by Category" description="Find tours, hotels, and destinations by category." />
            <div className="grid grid--4">
              {categories.map((cat) => (
                <Link key={cat.id} href={`/tours?category=${cat.slug}`} className="card category-card">
                  <div className="card__body">
                    <span className="card__badge">{cat.type}</span>
                    <h3>{cat.name}</h3>
                    {cat.description && <p>{cat.description}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="cta-section" style={{ backgroundImage: `url(${TRIP_IMAGE})` }}>
        <div className="cta-section__overlay">
          <div className="container cta-section__content">
            <h2>Make Your Own Trip</h2>
            <p>Tell us what you want, and we&apos;ll help you create a trip that perfectly matches your travel plans.</p>
            <Link href="/make-my-trip" className="btn btn--primary btn--lg">Plan My Trip</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader title="Why Choose Pehchaan Travels?" />
          <div className="grid grid--3">
            {features.map((f) => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="section section--beige">
          <div className="container">
            <SectionHeader title="What Our Travelers Say" />
            <div className="grid grid--3">
              {testimonials.map((review) => <ReviewCard key={review.id} review={review} />)}
            </div>
          </div>
        </section>
      )}

      <section className="cta-banner">
        <div className="container cta-banner__content">
          <h2>Ready to Explore Pakistan?</h2>
          <p>Start planning your next unforgettable journey with Pehchaan Travels.</p>
          <div className="cta-banner__actions">
            <Link href="/tours" className="btn btn--primary btn--lg">Explore Tours</Link>
            <Link href="/contact" className="btn btn--outline-light btn--lg">Contact Us</Link>
          </div>
        </div>
      </section>
    </>
  )
}
