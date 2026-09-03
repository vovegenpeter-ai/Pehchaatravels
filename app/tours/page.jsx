import { PageHero, SectionHeader } from '@/components/UI'
import TourCard from '@/components/TourCard'
import { getPublishedTours } from '@/lib/db'
import { HERO_IMAGE } from '@/lib/initialData'

export const revalidate = 60

export const metadata = {
  title: 'Tours — Pehchaan Travels',
}

export default async function ToursPage() {
  const tours = await getPublishedTours()

  return (
    <>
      <PageHero
        title="Our Tours"
        subtitle="Explore handpicked adventures across Pakistan's most breathtaking destinations"
        image={HERO_IMAGE}
      />
      <section className="section">
        <div className="container">
          <SectionHeader
            title="All Tour Packages"
            description="Browse our complete collection of tours. New packages added by our team appear here automatically."
          />
          {tours.length === 0 ? (
            <p className="empty-state">No tours available at the moment. Check back soon!</p>
          ) : (
            <div className="grid grid--3">
              {tours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
