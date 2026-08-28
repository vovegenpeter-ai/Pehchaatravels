import { PageHero, SectionHeader } from '@/components/UI'
import PlaceCard from '@/components/PlaceCard'
import { getPublishedDestinations } from '@/lib/db'
import { HERO_IMAGE } from '@/lib/initialData'

export const revalidate = 300

export const metadata = {
  title: 'Places — Pehchaan Travels',
}

export default async function PlacesPage() {
  const places = await getPublishedDestinations()

  return (
    <>
      <PageHero
        title="Destinations"
        subtitle="Discover Pakistan's most iconic destinations — from Hunza to Fairy Meadows"
        image={HERO_IMAGE}
      />
      <section className="section">
        <div className="container">
          <SectionHeader
            title="Explore Destinations"
            description="Each destination offers unique landscapes, culture, and unforgettable experiences."
          />
          {places.length === 0 ? (
            <p className="empty-state">No destinations available at the moment. Check back soon!</p>
          ) : (
            <div className="grid grid--3">
              {places.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
