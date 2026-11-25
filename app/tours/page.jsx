import { PageHero, SectionHeader } from '@/components/UI'
import TourCard from '@/components/TourCard'
import Breadcrumbs from '@/components/seo/Breadcrumbs'
import { getPublishedTours } from '@/lib/db'
import { HERO_IMAGE } from '@/lib/initialData'
import { buildMetadata } from '@/lib/seo'

export const revalidate = 60

export const metadata = buildMetadata({
  title: 'Pakistan Tour Packages — Group & Private',
  description:
    'Every Pakistan tour package we run, covering Hunza, Skardu, Swat, Kashmir, Kumrat and Fairy Meadows — with group departures and private tours from Lahore and Islamabad.',
  path: '/tours',
  keywords: [
    'Pakistan tour packages',
    'Northern Pakistan tour packages',
    'tour packages from Lahore',
    'group tour Pakistan',
    'private tour Pakistan',
    'Northern Areas tour packages',
  ],
})

export default async function ToursPage() {
  const tours = await getPublishedTours()

  return (
    <>
      <Breadcrumbs
        items={[
          { name: 'Home', path: '/' },
          { name: 'Tour Packages' },
        ]}
      />
      <PageHero
        title="Pakistan Tour Packages"
        subtitle="Guided group and private tours across Hunza, Skardu, Swat, Kashmir and the Karakoram — departing Lahore and Islamabad."
        image={HERO_IMAGE}
      />
      <section className="section">
        <div className="container">
          <SectionHeader
            title="All Tour Packages"
            description="Every itinerary below lists the full day-by-day schedule, what is included and excluded, the departure point and the per-person price. Filter by destination, then book online or ask us to tailor the trip."
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
