import { PageHero } from '@/components/UI'
import ContactForm from '@/components/ContactForm'
import { PHONE_NUMBER, EMAIL, ADDRESS, HERO_IMAGE } from '@/lib/initialData'

export const metadata = {
  title: 'Contact Us — Pehchaan Travels',
}

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Contact Us"
        subtitle="We'd love to hear from you — get in touch to plan your next adventure"
        image={HERO_IMAGE}
      />
      <section className="section">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info">
              <h2>Get In Touch</h2>
              <p>Have questions about our tours or need help planning your trip? Reach out anytime.</p>
              <ul className="contact-info__list">
                <li>
                  <strong>Phone</strong>
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
