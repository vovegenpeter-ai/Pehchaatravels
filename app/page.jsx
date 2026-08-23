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
      {/* Hero Section */}
      <section className="hero" style={{ backgroundImage: `url(${HERO_IMAGE})` }}>
        <div className="hero__overlay">
          <div className="container hero__content">
            <h1>Explore Pakistan, Create Unforgettable Memories</h1>
            <p>
              Discover the majestic peaks, vibrant cultures, and breathtaking landscapes of
              Northern Pakistan with our expertly curated tours.
            </p>
            <div className="hero__actions">
              <Link href="/tours" className="btn btn--orange btn--lg">Explore Tours</Link>
              <Link href="/make-my-trip" className="btn btn--outline-light btn--lg">Make My Trip</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Best Tours Section — Dark Background */}
      {featuredTours.length > 0 && (
        <section className="section section--dark" id="tours">
          <div className="container">
            <div className="section-header section-header--row">
              <div className="section-header__text">
                <h2>Discover Our Best Tours</h2>
                <p>Handpicked experiences for the adventurous soul.</p>
              </div>
              <Link href="/tours" className="section-header__link">View All Tours →</Link>
            </div>
            <div className="grid grid--3">
              {featuredTours.map((tour) => <TourCard key={tour.id} tour={tour} dark />)}
            </div>
          </div>
        </section>
      )}

      {/* Popular Tours */}
      {popularTours.length > 0 && (
        <section className="section section--dark">
          <div className="container">
            <div className="section-header section-header--row">
              <div className="section-header__text">
                <h2>Popular Tours</h2>
                <p>Our most loved tour packages by travelers.</p>
              </div>
              <Link href="/tours" className="section-header__link">View All Tours →</Link>
            </div>
            <div className="grid grid--3">
              {popularTours.map((tour) => <TourCard key={tour.id} tour={tour} dark />)}
            </div>
          </div>
        </section>
      )}

      {/* Latest Tours */}
      {latestTours.length > 0 && (
        <section className="section section--dark">
          <div className="container">
            <div className="section-header section-header--row">
              <div className="section-header__text">
                <h2>Latest Tours</h2>
                <p>Freshly added packages for your next adventure.</p>
              </div>
              <Link href="/tours" className="section-header__link">View All Tours →</Link>
            </div>
            <div className="grid grid--3">
              {latestTours.map((tour) => <TourCard key={tour.id} tour={tour} dark />)}
            </div>
          </div>
        </section>
      )}

      {/* Popular Destinations */}
      {destinations.length > 0 && (
        <section className="section section--dark" id="places">
          <div className="container">
            <div className="section-header section-header--row">
              <div className="section-header__text">
                <h2>Popular Destinations</h2>
                <p>From snow-capped peaks to lush valleys — discover Pakistan&apos;s most iconic destinations.</p>
              </div>
              <Link href="/places" className="section-header__link">View All Destinations →</Link>
            </div>
            <div className="grid grid--4">
              {destinations.map((place) => <PlaceCard key={place.id} place={place} dark />)}
            </div>
          </div>
        </section>
      )}

      {/* Featured Hotels */}
      {featuredHotels.length > 0 && (
        <section className="section section--dark" id="hotels">
          <div className="container">
            <div className="section-header section-header--row">
              <div className="section-header__text">
                <h2>Featured Hotels</h2>
                <p>Comfortable, handpicked accommodations to rest and recharge.</p>
              </div>
              <Link href="/hotels" className="section-header__link">View All Hotels →</Link>
            </div>
            <div className="grid grid--3">
              {featuredHotels.map((hotel) => <HotelCard key={hotel.id} hotel={hotel} dark />)}
            </div>
          </div>
        </section>
      )}

      {/* Make Your Own Trip CTA */}
      <section className="cta-section" style={{ backgroundImage: `url(${TRIP_IMAGE})` }}>
        <div className="cta-section__overlay">
          <div className="container cta-section__content">
            <h2>Make Your Own Trip</h2>
            <p>Don&apos;t want an off-the-shelf package? Tell us where you want to go, and our experts will craft a personalized itinerary just for you.</p>
            <Link href="/make-my-trip" className="btn btn--orange btn--lg">Plan My Trip</Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section section--dark">
        <div className="container">
          <SectionHeader title="Why Choose Pehchaan Travels?" />
          <div className="grid grid--3">
            {features.map((f) => <FeatureCard key={f.title} {...f} dark />)}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="section section--dark">
          <div className="container">
            <SectionHeader title="What Our Travelers Say" />
            <div className="grid grid--3">
              {testimonials.map((review) => <ReviewCard key={review.id} review={review} dark />)}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="cta-banner">
        <div className="container cta-banner__content">
          <h2>Ready to Explore Pakistan?</h2>
          <p>Start planning your next unforgettable journey with Pehchaan Travels.</p>
          <div className="cta-banner__actions">
            <Link href="/tours" className="btn btn--orange btn--lg">Explore Tours</Link>
            <Link href="/contact" className="btn btn--outline-light btn--lg">Contact Us</Link>
          </div>
        </div>
      </section>
    </>
  )
}
