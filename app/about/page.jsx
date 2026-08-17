import { PageHero, SectionHeader } from '@/components/UI'
import FeatureCard from '@/components/FeatureCard'
import { features, HERO_IMAGE } from '@/lib/initialData'

export const metadata = {
  title: 'About Us — Pehchaan Travels',
}

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="About Us"
        subtitle="Your trusted partner for exploring the beauty of Pakistan"
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
