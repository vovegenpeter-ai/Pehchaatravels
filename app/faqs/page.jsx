import { PageHero } from '@/components/UI'
import FaqClient from './FaqClient'
import Breadcrumbs from '@/components/seo/Breadcrumbs'
import JsonLd from '@/components/seo/JsonLd'
import { HERO_IMAGE } from '@/lib/initialData'
import { FAQ_DATA } from '@/lib/faq-data'
import { buildMetadata, faqPageSchema } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'Tour Booking FAQs & Cancellation Rules',
  description:
    'Answers to common questions about booking a Pakistan tour: the 40% advance deposit, payment methods, what packages include, cancellation rules, hotels, safety and what to pack.',
  path: '/faqs',
  keywords: [
    'Pakistan tour booking FAQ',
    'tour cancellation policy Pakistan',
    'Northern Pakistan travel questions',
    'Pehchaan Travels deposit',
  ],
})

export default function FaqsPage() {
  return (
    <>
      <Breadcrumbs
        items={[
          { name: 'Home', path: '/' },
          { name: 'FAQs' },
        ]}
      />
      {/* Rendered from the same data the accordion renders, so markup and
          visible content stay in sync as required by Google's guidelines. */}
      <JsonLd data={faqPageSchema(FAQ_DATA)} />
      <PageHero
        title="Frequently Asked Questions"
        subtitle="Find answers to common questions about tours, bookings, payments, and travel in Pakistan."
        image={HERO_IMAGE}
      />
      <section className="section faqs-section">
        <div className="container">
          <FaqClient />
        </div>
      </section>
    </>
  )
}
