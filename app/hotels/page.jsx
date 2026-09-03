import { PageHero, SectionHeader } from '@/components/UI'
import HotelCard from '@/components/HotelCard'
import { getPublishedHotels } from '@/lib/db'
import { HERO_IMAGE } from '@/lib/initialData'

export const revalidate = 60

export const metadata = {
  title: 'Hotels — Pehchaan Travels',
}

export default async function HotelsPage() {
  const hotels = await getPublishedHotels()

  return (
    <>
      <PageHero
        title="Hotels & Stays"
        subtitle="Comfortable accommodations handpicked for your Northern Pakistan adventure"
        image={HERO_IMAGE}
      />
      <section className="section">
        <div className="container">
          <SectionHeader
            title="Our Hotel Partners"
            description="Hotels managed from our admin panel appear here automatically."
          />
          {hotels.length === 0 ? (
            <p className="empty-state">No hotels available at the moment. Check back soon!</p>
          ) : (
            <div className="grid grid--3">
              {hotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
