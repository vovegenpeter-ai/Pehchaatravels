import { PageHero } from '@/components/UI'
import ContactForm from '@/components/ContactForm'
import Breadcrumbs from '@/components/seo/Breadcrumbs'
import { PHONE_NUMBER, EMAIL, ADDRESS, HERO_IMAGE } from '@/lib/initialData'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'Contact & Tour Enquiries',
  description:
    'Questions about a tour package, a custom itinerary or a hotel booking? Call, WhatsApp or message Pehchaan Travels and we will reply with dates, prices and availability.',
  path: '/contact',
  keywords: [
    'Pehchaan Travels contact',
    'Pakistan tour operator contact',
    'tour booking enquiry Pakistan',
  ],
})

export default function ContactPage() {
  return (
    <>
      <Breadcrumbs
        items={[
          { name: 'Home', path: '/' },
          { name: 'Contact Us' },
        ]}
      />
      <PageHero
        title="Contact Us"
        subtitle="We'd love to hear from you — get in touch to plan your next adventure."
        image={HERO_IMAGE}
      />
      <section className="section">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info">
              <h2>Get In Touch</h2>
              <p>Have questions about our tours or need help planning your trip? Reach out anytime — we normally reply the same day.</p>
              <ul className="contact-info__list">
                <li>
                  <strong>Phone &amp; WhatsApp</strong>
                  <a href={`tel:${PHONE_NUMBER.replace(/\s/g, '')}`}>{PHONE_NUMBER}</a>
                </li>
                <li>
                  <strong>Email</strong>
                  <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
                </li>
                <li>
                  <strong>Office</strong>
                  <span>{ADDRESS}</span>
                </li>
              </ul>
              <p style={{ marginTop: '1.25rem', color: '#4b5563', fontSize: '0.95rem' }}>
                Booking a tour? Our <a href="/faqs">frequently asked questions</a> cover deposits,
                payment methods, what is included, cancellation rules and what to pack — most
                questions are answered there.
              </p>
            </div>
            <div className="contact-form-wrap">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
