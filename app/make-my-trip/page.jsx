import { PageHero } from '@/components/UI'
import MakeMyTripForm from '@/components/MakeMyTripForm'
import { TRIP_IMAGE } from '@/lib/initialData'

export const metadata = {
  title: 'Make My Trip — Pehchaan Travels',
}

export default function MakeMyTripPage() {
  return (
    <>
      <PageHero
        title="Make Your Own Trip"
        subtitle="Tell us your dream itinerary and we'll craft the perfect journey for you"
        image={TRIP_IMAGE}
      />
      <section className="section">
        <div className="container container--narrow">
          <MakeMyTripForm />
        </div>
      </section>
    </>
  )
}
