'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getDestinationPath, getHotelPath } from '@/lib/pathUtils'
import { formatPrice } from '@/lib/tourUtils'

export default function PlacesAndHotelsSection({ places = [], hotels = [] }) {
  const [activeTab, setActiveTab] = useState('places')

  const viewAllLink = activeTab === 'places' ? '/places' : '/hotels'
  const viewAllLabel = activeTab === 'places' ? 'View All Places →' : 'View All Hotels →'

  return (
    <section className="places-hotels-section" id="places-and-hotels">
      <div className="container">
        {/* Header Row */}
        <div className="places-hotels-header">
          <div className="places-hotels-header__text">
            <h2 className="places-hotels-header__title">Popular Places &amp; Hotels</h2>
            <p className="places-hotels-header__subtitle">
              Explore the most popular destinations and stay at the best hotels across Pakistan.
            </p>
          </div>

          <Link href={viewAllLink} className="places-hotels-header__link">
            {viewAllLabel}
          </Link>
        </div>

        {/* Tab Toggle Controls */}
        <div className="places-hotels-tabs">
          <button
            type="button"
            className={`places-hotels-tab ${activeTab === 'places' ? 'places-hotels-tab--active' : ''}`}
            onClick={() => setActiveTab('places')}
          >
            Popular Places
          </button>
          <button
            type="button"
            className={`places-hotels-tab ${activeTab === 'hotels' ? 'places-hotels-tab--active' : ''}`}
            onClick={() => setActiveTab('hotels')}
          >
            Popular Hotels
          </button>
        </div>

        {/* Places Tab Content */}
        {activeTab === 'places' && (
          <div className="places-hotels-grid">
            {places.slice(0, 4).map((place) => {
              const rating = place.rating ? Number(place.rating).toFixed(1) : '4.9'
              const destUrl = getDestinationPath(place)

              return (
                <article key={place.id || place.slug} className="ph-card">
                  <Link href={destUrl} className="ph-card__image-wrap" tabIndex={-1}>
                    <img
                      src={place.image || place.bannerImage}
                      alt={place.name}
                      loading="lazy"
                      className="ph-card__image"
                    />
                    <div className="ph-card__rating">
                      <span className="ph-card__star">★</span>
                      <span>{rating}</span>
                    </div>
                  </Link>

                  <div className="ph-card__body">
                    {place.location && (
                      <span className="ph-card__location">📍 {place.location}</span>
                    )}

                    <h3 className="ph-card__title">
                      <Link href={destUrl}>{place.name}</Link>
                    </h3>

                    <p className="ph-card__desc">{place.shortDescription || place.description}</p>

                    <div className="ph-card__divider" />

                    <div className="ph-card__footer">
                      <Link href={destUrl} className="ph-card__btn">
                        View Details
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {/* Hotels Tab Content */}
        {activeTab === 'hotels' && (
          <div className="places-hotels-grid">
            {hotels.slice(0, 4).map((hotel) => {
              const rating = hotel.rating ? Number(hotel.rating).toFixed(1) : '4.8'
              const hotelUrl = getHotelPath(hotel)
              const displayPrice = hotel.pricePerNight
                ? `PKR ${formatPrice(hotel.pricePerNight)}`
                : 'Contact for rates'

              return (
                <article key={hotel.id || hotel.slug} className="ph-card">
                  <Link href={hotelUrl} className="ph-card__image-wrap" tabIndex={-1}>
                    <img
                      src={hotel.image || hotel.bannerImage}
                      alt={hotel.name}
                      loading="lazy"
                      className="ph-card__image"
                    />
                    <div className="ph-card__rating">
                      <span className="ph-card__star">★</span>
                      <span>{rating}</span>
                    </div>
                  </Link>

                  <div className="ph-card__body">
                    {hotel.location && (
                      <span className="ph-card__location">📍 {hotel.location}</span>
                    )}

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

                      <Link href={hotelUrl} className="ph-card__btn">
                        View Hotel
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
