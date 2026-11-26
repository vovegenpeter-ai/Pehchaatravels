import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import ImageGallery from '@/components/ImageGallery'
import TourCard from '@/components/TourCard'
import BookTourButton from '@/components/BookTourButton'
import BookingTypeSelector from '@/components/BookingTypeSelector'
import { SectionHeader } from '@/components/UI'
import Breadcrumbs from '@/components/seo/Breadcrumbs'
import JsonLd from '@/components/seo/JsonLd'
import ViewContentTracker from '@/components/seo/ViewContentTracker'
import { getTourBySlugOrId, getRelatedTours, getTourReviewStats } from '@/lib/db'
import { formatPrice } from '@/lib/tourUtils'
import { cloudinaryImg } from '@/lib/cloudinaryUrl'
import ReviewsList from '@/components/ReviewsList'
import WriteReviewButton from '@/components/WriteReviewButton'
import ReviewStatusBanner from '@/components/ReviewStatusBanner'
import TourFaq from '@/components/TourFaq'
import {
  buildMetadata,
  absoluteUrl,
  stripHtml,
  faqPageSchema,
  aggregateRatingSchema,
  BUSINESS,
} from '@/lib/seo'

export const revalidate = 60

export async function generateMetadata({ params }) {
  const { slug } = await params
  const tour = await getTourBySlugOrId(slug)
  if (!tour) return { title: 'Tour Not Found' }

  const destination = (tour.destination || '').trim()
  const summary = stripHtml(tour.shortDescription || tour.fullDescription || tour.description)

  return buildMetadata({
    title: `${tour.name}${destination ? ` — ${destination} Tour` : ''}`,
    description: `${summary} ${tour.duration || ''} from PKR ${formatPrice(
      tour.price
    )} per person. Full itinerary, inclusions and booking details.`.replace(/\s+/g, ' ').trim(),
    path: `/tours/${tour.slug}`,
    image: tour.image,
    keywords: [
      `${tour.name} tour package`,
      `${destination} tour package`.toLowerCase(),
      'Northern Pakistan tour',
      'tour packages from Lahore',
      'Pakistan family tour package',
    ],
  })
}

function InfoItem({ label, value, icon }) {
  return (
    <div className="tour-info-item">
      <span className="tour-info-item__icon" aria-hidden="true">{icon}</span>
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

  /* The lookup accepts a raw database ID as well as the slug, which historically
     produced two indexable URLs for one tour. Send every ID-based request to the
     canonical slug URL so link equity consolidates instead of splitting. */
  if (tour.slug && slug !== tour.slug) {
    redirect(`/tours/${tour.slug}`)
  }

  const [relatedTours, reviewStats] = await Promise.all([
    getRelatedTours(tour.id, 3),
    getTourReviewStats(tour.id),
  ])

  const description = tour.fullDescription || tour.description
  const itinerary = tour.itinerary || []
  const faqs = Array.isArray(tour.faqs) ? tour.faqs : []
  const tourUrl = `/tours/${tour.slug}`
  const heroImage = cloudinaryImg(tour.image, { width: 1600 })

  /* --- Structured data -------------------------------------------------
     Only markup we can substantiate is emitted: the real price from the
     database, the admin-authored FAQs, and an AggregateRating that is
     suppressed entirely unless approved customer reviews actually exist. */
  const ratingSchema = aggregateRatingSchema({
    count: reviewStats.count,
    average: reviewStats.average,
    url: absoluteUrl(tourUrl),
  })

  const tourSchema = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: tour.name,
    description: stripHtml(tour.shortDescription || tour.fullDescription).slice(0, 800),
    url: absoluteUrl(tourUrl),
    touristType: ['Families', 'Couples', 'Adventure travellers'],
    itinerary: itinerary.length
      ? {
          '@type': 'ItemList',
          numberOfItems: itinerary.length,
          itemListElement: itinerary.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: `${item.day}: ${item.title}`,
          })),
        }
      : undefined,
    provider: {
      '@type': 'TravelAgency',
      name: BUSINESS.name,
      url: BUSINESS.url,
      telephone: BUSINESS.telephone,
      email: BUSINESS.email,
    },
    offers: {
      '@type': 'Offer',
      price: Number(tour.price || 0),
      priceCurrency: 'PKR',
      url: absoluteUrl(tourUrl),
      availability: 'https://schema.org/InStock',
      category: 'Tour package',
      ...(tour.couplePrice
        ? {
            additionalType: 'https://schema.org/UnitPriceSpecification',
            priceSpecification: [
              {
                '@type': 'UnitPriceSpecification',
                name: 'Per person',
                price: Number(tour.price || 0),
                priceCurrency: 'PKR',
              },
              {
                '@type': 'UnitPriceSpecification',
                name: 'Per couple (2 persons)',
                price: Number(tour.couplePrice),
                priceCurrency: 'PKR',
              },
            ],
          }
        : {}),
    },
    ...(ratingSchema ? { aggregateRating: ratingSchema } : {}),
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { name: 'Home', path: '/' },
          { name: 'Tour Packages', path: '/tours' },
          { name: tour.name },
        ]}
      />
      <JsonLd
        data={[
          tourSchema,
          faqPageSchema(faqs),
        ]}
      />
      <ViewContentTracker
        id={tour.slug || tour.id}
        name={tour.name}
        type="destination"
        category={tour.destination || 'Tour Package'}
        city={tour.destination || undefined}
        value={Number(tour.price) || undefined}
        description={tour.duration || undefined}
      />

      {/* 1. Tour Banner */}
      <section
        className="tour-detail-hero"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="tour-detail-hero__overlay">
          <div className="container">
            <h1>{tour.name}</h1>
            {tour.shortDescription && (
              <p className="tour-detail-hero__subtitle">{tour.shortDescription}</p>
            )}

          </div>
        </div>
      </section>

      {/* 1b. Photo Gallery */}
      <ImageGallery images={tour.images || []} context={tour.name} />

      {/* 1c. Points to Cover — admin-managed highlight chips */}
      {(tour.pointsToCover || []).filter((p) => p.enabled && p.label).length > 0 && (
        <section className="points-to-cover-section">
          <div className="container">
            <div className="points-to-cover">
              <span className="points-to-cover__label">Highlights</span>
              <h2 className="points-to-cover__title">Points to Cover</h2>
              <div className="points-to-cover__divider" />
              <div className="points-to-cover__tags">
                {tour.pointsToCover
                  .filter((p) => p.enabled && p.label)
                  .map((p) => (
                    <span key={p.id} className="points-to-cover__tag">
                      <svg
                        className="points-to-cover__pin"
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        width="14"
                        height="14"
                        fill="currentColor"
                      >
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
                      </svg>
                      {p.label}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. Tour Information */}
      <section className="section section--beige tour-info-section">
        <div className="container">
          <h2 className="tour-section-title">Tour Information</h2>
          <div className="tour-info-grid">
            <InfoItem label="Tour Name" value={tour.name} icon="🎒" />
            <InfoItem label="Duration" value={tour.duration || `${tour.days} Days`} icon="⏱️" />
            <InfoItem label="Starting Date" value={tour.startDate || 'Contact for dates'} icon="📅" />
            <InfoItem label="Starting Time" value={tour.startTime || 'TBA'} icon="🕐" />
            <InfoItem label="Ending Date" value={tour.endDate || 'Contact for dates'} icon="📅" />
            <InfoItem label="Ending Time" value={tour.endTime || 'TBA'} icon="🕐" />
            <InfoItem label="Location" value={tour.destination} icon="📍" />
            <InfoItem label="Price" value={`PKR ${formatPrice(tour.price)}`} icon="💰" />
          </div>
        </div>
      </section>

      <div className="container tour-detail-layout">
        <div className="tour-detail-content">
          <section className="tour-detail-block">
            <h2 className="tour-section-title">About This Tour</h2>
            <div className="tour-description" dangerouslySetInnerHTML={{ __html: description }} />
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

          {/* Cancellation Policy — optional, admin-managed rich text */}
          {tour.cancellationPolicy?.trim() && (
            <section className="tour-detail-block">
              <h2 className="tour-section-title">Cancellation Policy</h2>
              <div
                className="tour-cancellation"
                dangerouslySetInnerHTML={{ __html: tour.cancellationPolicy }}
              />
            </section>
          )}
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
            {tour.couplePrice != null && tour.couplePrice > 0 ? (
              /* Couple price configured — selector picks Single or Couple rate */
              <BookingTypeSelector tour={tour} />
            ) : (
              <BookTourButton tour={tour} />
            )}
            <Link href="/make-my-trip" className="btn btn--outline btn--full">
              Customize Trip
            </Link>
          </div>
        </aside>
      </div>

      {/* 4b. FAQs */}
      {faqs.length > 0 && (
        <TourFaq faqs={faqs} />
      )}

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
