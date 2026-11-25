import { PageHero, SectionHeader } from '@/components/UI'
import HotelCard from '@/components/HotelCard'
import Breadcrumbs from '@/components/seo/Breadcrumbs'
import { getPublishedHotels } from '@/lib/db'
import { HERO_IMAGE } from '@/lib/initialData'
import { buildMetadata } from '@/lib/seo'

export const revalidate = 60

export const metadata = buildMetadata({
  title: 'Hotels in Northern Pakistan',
  description:
    'Browse the hotels and resorts we book across Hunza, Skardu, Swat, Gilgit and the Kaghan Valley, with per-night prices, amenities and room types for each stay.',
  path: '/hotels',
  keywords: [
    'hotels in northern Pakistan',
    'Hunza hotels',
    'Skardu hotels',
    'Swat hotels',
    'Gilgit-Baltistan resorts',
  ],
})

export default async function HotelsPage() {
  const hotels = await getPublishedHotels()

  return (
    <>
      <Breadcrumbs
        items={[
          { name: 'Home', path: '/' },
          { name: 'Hotels' },
        ]}
      />
      <PageHero
        title="Hotels & Stays in Northern Pakistan"
        subtitle="Comfortable accommodations handpicked for your Northern Pakistan adventure."
        image={HERO_IMAGE}
      />
      <section className="section">
        <div className="container">
          <SectionHeader
            title="Our Hotel Partners"
            description="We book these properties directly for our tour guests. Each listing shows the location, per-night rate, amenities and room types, and you can reserve any of them with a tour or on its own."
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
