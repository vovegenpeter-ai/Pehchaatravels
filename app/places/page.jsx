import Link from 'next/link'
import { getDestinationCategories } from '@/lib/db'
import { HERO_IMAGE } from '@/lib/initialData'

export const revalidate = 300

export const metadata = {
  title: 'Places — Pehchaan Travels',
  description: 'Discover Pakistan\'s most breathtaking destinations — from the peaks of Gilgit-Baltistan to the shores of Sindh.',
}

/* Category images for visual appeal */
const categoryImages = {
  'kashmir': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'gilgit-baltistan': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
  'khyber-pakhtunkhwa': 'https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=800&q=80',
  'kpk': 'https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=800&q=80',
  'punjab': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
  'sindh': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
  'balochistan': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
}

const fallbackImage = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80'

export default async function PlacesPage() {
  const categories = await getDestinationCategories()

  return (
    <>
      {/* Hero Section */}
      <section
        className="places-hero"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      >
        <div className="places-hero__overlay">
          <div className="container">
            <div className="places-hero__content">
              <span className="places-hero__tag">Explore Pakistan</span>
              <h1 className="places-hero__title">
                Discover the Beauty of<br />Pakistan's Destinations
              </h1>
              <p className="places-hero__subtitle">
                From the towering peaks of the Karakoram to the serene valleys of Kashmir — 
                explore diverse landscapes, rich culture, and unforgettable adventures across Pakistan.
              </p>
              <div className="places-hero__stats">
                <div className="places-hero__stat">
                  <span className="places-hero__stat-num">{categories.length}+</span>
                  <span className="places-hero__stat-label">Regions</span>
                </div>
                <div className="places-hero__stat">
                  <span className="places-hero__stat-num">
                    {categories.reduce((sum, c) => sum + c.destinationCount, 0)}+
                  </span>
                  <span className="places-hero__stat-label">Destinations</span>
                </div>
                <div className="places-hero__stat">
                  <span className="places-hero__stat-num">6</span>
                  <span className="places-hero__stat-label">Provinces</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Heading */}
      <section className="section places-intro">
        <div className="container">
          <div className="places-intro__text">
            <h2 className="places-intro__title">Explore by Region</h2>
            <p className="places-intro__subtitle">
              Choose a region to discover its subcategories and hidden gems — each offering 
              unique landscapes, culture, and unforgettable travel experiences.
            </p>
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="section places-categories" style={{ paddingTop: 0 }}>
        <div className="container">
          {categories.length === 0 ? (
            <div className="places-empty">
              <p>No destinations available at the moment. Check back soon!</p>
            </div>
          ) : (
            <div className="places-categories__grid">
              {categories.map((category) => {
                const img = categoryImages[category.slug] || fallbackImage
                return (
                  <Link
                    key={category.id}
                    href={`/places/${category.slug}`}
                    className="places-category-card"
                  >
                    <div className="places-category-card__image">
                      <img src={img} alt={category.name} loading="lazy" />
                      <div className="places-category-card__badge">
                        {category.destinationCount} {category.destinationCount === 1 ? 'place' : 'places'}
                      </div>
                    </div>
                    <div className="places-category-card__body">
                      <h3 className="places-category-card__name">{category.name}</h3>
                      {category.description && (
                        <p className="places-category-card__desc">{category.description}</p>
                      )}
                      {category.children.length > 0 && (
                        <div className="places-category-card__subs">
                          {category.children.slice(0, 3).map((sub) => (
                            <span key={sub.id} className="places-category-card__sub-tag">
                              {sub.name}
                            </span>
                          ))}
                          {category.children.length > 3 && (
                            <span className="places-category-card__sub-tag places-category-card__sub-tag--more">
                              +{category.children.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                      <span className="places-category-card__cta">
                        Explore {category.name} →
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
