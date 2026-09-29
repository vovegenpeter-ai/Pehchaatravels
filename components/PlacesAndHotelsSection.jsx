'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getDestinationPath, getHotelPath } from '@/lib/pathUtils'
import { formatPrice } from '@/lib/tourUtils'
import { cloudinaryImg } from '@/lib/cloudinaryUrl'

/* Number of cards visible at once in the featured carousel — matches the
   site-wide 3-per-row card grid (same card width as tour cards) */
const PAGE_SIZE = 3

/* Chevron icon shared by both arrow buttons */
function Chevron({ dir }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {dir === 'left' ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
    </svg>
  )
}

/**
 * Sliding-window carousel for featured cards.
 * Shows PAGE_SIZE cards at a time; prev/next arrows appear only when there
 * are more than PAGE_SIZE entries and step one card at a time.
 */
function CardCarousel({ items = [], renderCard, emptyMessage }) {
  const [start, setStart] = useState(0)

  const hasOverflow = items.length > PAGE_SIZE
  const maxStart = Math.max(0, items.length - PAGE_SIZE)
  const safeStart = Math.min(start, maxStart)
  const visible = items.slice(safeStart, safeStart + PAGE_SIZE)

  if (items.length === 0) {
    return emptyMessage ? <p className="places-hotels-empty">{emptyMessage}</p> : null
  }

  return (
    <div className="places-hotels-carousel">
      {hasOverflow && (
        <button
          type="button"
          className="ph-nav ph-nav--prev"
          onClick={() => setStart(Math.max(0, safeStart - 1))}
          disabled={safeStart === 0}
          aria-label="Previous items"
        >
          <Chevron dir="left" />
        </button>
      )}

      <div className="places-hotels-grid">
        {visible.map((item) => renderCard(item))}
      </div>

      {hasOverflow && (
        <button
          type="button"
          className="ph-nav ph-nav--next"
          onClick={() => setStart(Math.min(maxStart, safeStart + 1))}
          disabled={safeStart >= maxStart}
          aria-label="Next items"
        >
          <Chevron dir="right" />
        </button>
      )}
    </div>
  )
}

export default function PlacesAndHotelsSection({ places = [], hotels = [] }) {
  const [activeTab, setActiveTab] = useState('places')

  const viewAllLink = activeTab === 'places' ? '/places' : '/hotels'

  const renderPlaceCard = (place) => {
    const destUrl = getDestinationPath(place)
    return (
      <article key={place.id || place.slug} className="ph-card">
        <Link href={destUrl} className="ph-card__image-wrap" tabIndex={-1}>
          <img
            src={cloudinaryImg(place.image || place.bannerImage, { width: 600 })}
            alt={place.name}
            loading="lazy"
            className="ph-card__image"
          />
        </Link>

        <div className="ph-card__body">
          <h3 className="ph-card__title">
            <Link href={destUrl}>{place.name}</Link>
          </h3>

          <p className="ph-card__desc">{place.shortDescription || place.description}</p>

          <div className="ph-card__divider" />

          <div className="ph-card__footer">
            <Link href={destUrl} className="btn btn--primary btn--sm ph-card__btn">
              View Details
            </Link>
          </div>
        </div>
      </article>
    )
  }

  const renderHotelCard = (hotel) => {
    const hotelUrl = getHotelPath(hotel)
    const displayPrice = hotel.pricePerNight
      ? `PKR ${formatPrice(hotel.pricePerNight)}`
      : 'Contact for rates'

    return (
      <article key={hotel.id || hotel.slug} className="ph-card">
        <Link href={hotelUrl} className="ph-card__image-wrap" tabIndex={-1}>
          <img
            src={cloudinaryImg(hotel.image || hotel.bannerImage, { width: 600 })}
            alt={hotel.name}
            loading="lazy"
            className="ph-card__image"
          />
        </Link>

        <div className="ph-card__body">
          <h3 className="ph-card__title">
            <Link href={hotelUrl}>{hotel.name}</Link>
          </h3>

          <p className="ph-card__desc">{hotel.shortDescription || hotel.description}</p>

          <div className="ph-card__divider" />

          <div className="ph-card__footer ph-card__footer--hotel">
            {hotel.pricePerNight && (
              <div className="ph-card__price-wrap">
                <span className="ph-card__price-label">Starting from</span>
                <span className="ph-card__price-value">{displayPrice}</span>
              </div>
            )}

            <Link href={hotelUrl} className="btn btn--primary btn--sm ph-card__btn">
              View Hotel
            </Link>
          </div>
        </div>
      </article>
    )
  }

  return (
    <section className="places-hotels-section" id="places-and-hotels">
      <div className="container">
        {/* Header Row */}
        <div className="places-hotels-header">
          <div className="places-hotels-header__text">
            <h2 className="places-hotels-header__title">Featured Places &amp; Hotels</h2>
            <p className="places-hotels-header__subtitle">
              Explore featured destinations and stay at the best hotels across Pakistan.
            </p>
          </div>
        </div>

        {/* Tab Toggle Controls */}
        <div className="places-hotels-tabs">
          <button
            type="button"
            className={`places-hotels-tab ${activeTab === 'places' ? 'places-hotels-tab--active' : ''}`}
            onClick={() => setActiveTab('places')}
          >
            Featured Places
          </button>
          <button
            type="button"
            className={`places-hotels-tab ${activeTab === 'hotels' ? 'places-hotels-tab--active' : ''}`}
            onClick={() => setActiveTab('hotels')}
          >
            Featured Hotels
          </button>
        </div>

        {/* Places Tab Content */}
        {activeTab === 'places' && (
          <CardCarousel
            items={places}
            renderCard={renderPlaceCard}
            emptyMessage="No featured places available yet."
          />
        )}

        {/* Hotels Tab Content */}
        {activeTab === 'hotels' && (
          <CardCarousel items={hotels} renderCard={renderHotelCard} />
        )}

        {/* Centered View All CTA at the bottom */}
        <div className="section-view-all-wrap">
          <Link href={viewAllLink} className="btn-view-all">
            {activeTab === 'places' ? 'View All Places' : 'View All Hotels'}
          </Link>
        </div>
      </div>
    </section>
  )
}
