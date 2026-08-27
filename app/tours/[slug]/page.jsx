import Link from 'next/link'
import { notFound } from 'next/navigation'
import TourCard from '@/components/TourCard'
import BookTourButton from '@/components/BookTourButton'
import { SectionHeader } from '@/components/UI'
import { getTourBySlugOrId, getRelatedTours } from '@/lib/db'
import { formatPrice } from '@/lib/tourUtils'
import ReviewsList from '@/components/ReviewsList'
import WriteReviewButton from '@/components/WriteReviewButton'
import ReviewStatusBanner from '@/components/ReviewStatusBanner'

export const revalidate = 300

export async function generateMetadata({ params }) {
  const { slug } = await params
  const tour = await getTourBySlugOrId(slug)
  if (!tour) return { title: 'Tour Not Found — Pehchaan Travels' }
  return {
    title: `${tour.name} — Pehchaan Travels`,
    description: tour.shortDescription || tour.description,
  }
}

function InfoItem({ label, value, icon }) {
  return (
    <div className="tour-info-item">
      <span className="tour-info-item__icon">{icon}</span>
      <div>
        <span className="tour-info-item__label">{label}</span>
        <span className="tour-info-item__value">{value}</span>
      </div>
    </div>
  )
}

export default async function TourDetailPage({ params }) {
  const { slug } = await params
  const tour = await getTourBySlugOrId(slug)

  if (!tour) notFound()

  const relatedTours = await getRelatedTours(tour.id, 3)

  const description = tour.fullDescription || tour.description
  const itinerary = tour.itinerary || []

  return (
    <>
      {/* 1. Tour Banner */}
      <section
        className="tour-detail-hero"
        style={{ backgroundImage: `url(${tour.image})` }}
      >
        <div className="tour-detail-hero__overlay">
          <div className="container">
            <h1>{tour.name}</h1>
            {tour.shortDescription && (
              <p className="tour-detail-hero__subtitle">{tour.shortDescription}</p>
            )}
            <span className="tour-detail-hero__badge">{tour.duration || `${tour.days} Days`}</span>
          </div>
        </div>
      </section>

      {/* 2. Tour Information */}
      <section className="section section--beige tour-info-section">
        <div className="container">
          <h2 className="tour-section-title">Tour Information</h2>
          <div className="tour-info-grid">
            <InfoItem label="Tour Name" value={tour.name} icon="🎒" />
            <InfoItem label="Starting Date" value={tour.startDate || 'Contact for dates'} icon="📅" />
            <InfoItem label="Starting Time" value={tour.startTime || 'TBA'} icon="🕐" />
            <InfoItem label="Ending Date" value={tour.endDate || 'Contact for dates'} icon="📅" />
            <InfoItem label="Ending Time" value={tour.endTime || 'TBA'} icon="🕐" />
            <InfoItem label="Duration" value={tour.duration || `${tour.days} Days`} icon="⏱" />
            <InfoItem label="Location" value={tour.destination} icon="📍" />
            <InfoItem label="Price" value={`PKR ${formatPrice(tour.price)}`} icon="💰" />
          </div>
        </div>
      </section>

      <div className="container tour-detail-layout">
        <div className="tour-detail-content">
          <section className="tour-detail-block">
            <h2 className="tour-section-title">About This Tour</h2>
            <div className="tour-description">
              {description.split('\n\n').map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>
          </section>

          {(tour.includedServices?.length > 0 || tour.excludedServices?.length > 0) && (
            <section className="tour-detail-block">
              <h2 className="tour-section-title">What&apos;s Included & Excluded</h2>
              <div className="grid grid--2">
                {tour.includedServices?.length > 0 && (
                  <div>
                    <h3>Included</h3>
                    <ul className="tour-highlights">
                      {tour.includedServices.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                )}
                {tour.excludedServices?.length > 0 && (
                  <div>
                    <h3>Excluded</h3>
                    <ul className="tour-highlights">
                      {tour.excludedServices.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}

          <section className="tour-detail-block">
            <h2 className="tour-section-title">Tour Schedule</h2>
            <div className="tour-schedule-summary">
              <div className="tour-schedule-summary__item">
                <strong>Start</strong>
                <span>{tour.startDate} · {tour.startTime}</span>
              </div>
              <div className="tour-schedule-summary__item">
                <strong>End</strong>
                <span>{tour.endDate} · {tour.endTime}</span>
              </div>
              <div className="tour-schedule-summary__item tour-schedule-summary__item--full">
                <strong>Meeting Point</strong>
                <span>{tour.meetingPoint || 'To be confirmed upon booking'}</span>
              </div>
            </div>

            {itinerary.length > 0 && (
              <div className="tour-itinerary">
                {itinerary.map((item) => (
                  <article key={`${item.day}-${item.title}`} className="tour-itinerary__item">
                    <div className="tour-itinerary__marker">
                      <span className="tour-itinerary__day">{item.day}</span>
                      <span className="tour-itinerary__time">{item.time}</span>
                    </div>
                    <div className="tour-itinerary__body">
                      <h3>{item.title}</h3>
                      <ul>
                        {item.activities.map((activity) => (
                          <li key={activity}>{activity}</li>
                        ))}
                      </ul>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="tour-detail-sidebar">
          <div className="tour-detail-card">
            <div className="tour-detail-card__price">
              <span>From</span>
              <strong>PKR {formatPrice(tour.price)}</strong>
              <small>per person</small>
            </div>
            <ul className="tour-detail-summary">
              <li><strong>Rating</strong><span>★ {tour.rating}</span></li>
              <li><strong>Duration</strong><span>{tour.duration || `${tour.days} Days`}</span></li>
              <li><strong>Destination</strong><span>{tour.destination}</span></li>
            </ul>
            <BookTourButton tour={tour} />
            <Link href="/make-my-trip" className="btn btn--outline btn--full">
              Customize Trip
            </Link>
          </div>
        </aside>
      </div>

      {/* 5. Reviews Section */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <SectionHeader
            title="Customer Reviews"
            description="See what our travelers have to say"
          />
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <ReviewStatusBanner tourId={tour.id} />
            <ReviewsList tourId={tour.id} />
            <div style={{ marginTop: '2rem' }}>
              <WriteReviewButton tourId={tour.id} />
            </div>
          </div>
        </div>
      </section>

      {/* 6. Related Tours */}
      {relatedTours.length > 0 && (
        <section className="section section--beige">
          <div className="container">
            <SectionHeader
              title="Related Tours"
              description="Explore more adventures you might love"
            />
            <div className="grid grid--3">
              {relatedTours.map((related) => (
                <TourCard key={related.id} tour={related} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
