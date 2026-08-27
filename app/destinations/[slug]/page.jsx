import Link from 'next/link'
import { notFound } from 'next/navigation'
import PlaceCard from '@/components/PlaceCard'
import TourCard from '@/components/TourCard'
import HotelCard from '@/components/HotelCard'
import { SectionHeader } from '@/components/UI'
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

  const related = await getRelatedDestinations(destination.id, 4)

  return (
    <>
      <section className="tour-detail-hero" style={{ backgroundImage: `url(${destination.image})` }}>
        <div className="tour-detail-hero__overlay">
          <div className="container">
            <h1>{destination.name}</h1>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="tour-section-title">About {destination.name}</h2>
          <div className="tour-description">
            {(destination.fullDescription || destination.description).split('\n\n').map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {destination.tours?.length > 0 && (
        <section className="section section--beige">
          <div className="container">
            <SectionHeader title={`Tours in ${destination.name}`} description="Explore curated tour packages for this destination" />
            <div className="grid grid--3">
              {destination.tours.map((tour) => <TourCard key={tour.id} tour={tour} />)}
            </div>
          </div>
        </section>
      )}

      {destination.hotels?.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHeader title={`Hotels in ${destination.name}`} description="Comfortable stays in this region" />
            <div className="grid grid--3">
              {destination.hotels.map((hotel) => <HotelCard key={hotel.id} hotel={hotel} />)}
            </div>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="section section--beige">
          <div className="container">
            <SectionHeader title="Other Destinations" description="Discover more places across Pakistan" />
            <div className="grid grid--4">
              {related.map((place) => <PlaceCard key={place.id} place={place} />)}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
