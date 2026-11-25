import { PageHero, SectionHeader } from '@/components/UI'
import FeatureCard from '@/components/FeatureCard'
import Breadcrumbs from '@/components/seo/Breadcrumbs'
import { features, HERO_IMAGE } from '@/lib/initialData'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'About Our Pakistan Tour Operator',
  description:
    'Pehchaan Travels runs group and private tours across Pakistan — Hunza, Skardu, Naran, Swat and Kashmir — with experienced guides, private transport and handpicked hotels.',
  path: '/about',
  keywords: ['Pakistan tour operator', 'Northern Pakistan travel agency', 'tour company Lahore'],
})

export default function AboutPage() {
  return (
    <>
      <Breadcrumbs
        items={[
          { name: 'Home', path: '/' },
          { name: 'About Us' },
        ]}
      />
      <PageHero
        title="About Us"
        subtitle="Your trusted partner for exploring the beauty of Pakistan."
        image={HERO_IMAGE}
      />
      <section className="section">
        <div className="container container--narrow">
          <div className="about-content">
            <h2>Who We Are</h2>
            <p>
              Pehchaan Travels is a premier travel and tourism company specializing in
              Pakistan&apos;s Northern Areas and beyond. Founded with a passion for adventure
              and a deep love for our homeland, we help travelers discover the breathtaking
              beauty of Hunza, Skardu, Naran, Swat, and countless other hidden gems.
            </p>
            <p>
              We run scheduled group departures as well as fully private and customised tours
              for families, couples and corporate groups, with pickup points in Lahore and
              Islamabad. Every itinerary we publish lists the day-by-day schedule, the hotels,
              what is included and excluded, and the per-person price, so you know exactly what
              you are booking before you pay the advance.
            </p>
            <p>
              Our team of experienced tour guides, travel planners, and hospitality experts
              work tirelessly to ensure every journey is safe, comfortable, and unforgettable.
              From curated tour packages to custom trip planning, we handle every detail so
              you can focus on making memories.
            </p>
          </div>
        </div>
      </section>
      <section className="section section--beige">
        <div className="container">
          <SectionHeader title="Why Travel With Us" />
          <div className="grid grid--3">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
