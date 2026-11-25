import { PageHero } from '@/components/UI'
import MakeMyTripForm from '@/components/MakeMyTripForm'
import Breadcrumbs from '@/components/seo/Breadcrumbs'
import { TRIP_IMAGE } from '@/lib/initialData'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'Custom Pakistan Tour Package',
  description:
    'Tell us where you want to go, your travel dates, group size and budget, and we will design a private Pakistan tour itinerary with an exact quote. Families, couples and corporate groups welcome.',
  path: '/make-my-trip',
  keywords: [
    'custom tour package Pakistan',
    'private tour Pakistan family',
    'honeymoon tour package Pakistan',
    'customized northern areas itinerary',
    'group tour Pakistan',
  ],
})

export default function MakeMyTripPage() {
  return (
    <>
      <Breadcrumbs
        items={[
          { name: 'Home', path: '/' },
          { name: 'Make My Trip' },
        ]}
      />
      <PageHero
        title="Make Your Own Trip"
        subtitle="Tell us your dream itinerary and we'll craft the perfect journey for you."
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
