import Link from 'next/link'
import { getDestinationCategories } from '@/lib/db'
import { HERO_IMAGE } from '@/lib/initialData'
import { cloudinaryImg } from '@/lib/cloudinaryUrl'
import Breadcrumbs from '@/components/seo/Breadcrumbs'
import { buildMetadata } from '@/lib/seo'

export const revalidate = 60

export const metadata = buildMetadata({
  title: 'Places to Visit in Northern Pakistan',
  description:
    'Explore the destinations we cover across Northern Pakistan — Hunza and Skardu in Gilgit-Baltistan to the valleys of Swat, Kumrat and Neelum. Browse by region.',
  path: '/places',
  keywords: [
    'places to visit in northern Pakistan',
    'Gilgit-Baltistan destinations',
    'Hunza Skardu Swat Kashmir',
    'tourist places in Pakistan',
  ],
})

const fallbackImage = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80'

export default async function PlacesPage() {
  const categories = await getDestinationCategories()

  return (
    <>
      <Breadcrumbs
        items={[
          { name: 'Home', path: '/' },
          { name: 'Places' },
        ]}
      />
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
                Top Places to Visit in Pakistan
              </h1>
              <p className="places-hero__subtitle">
                From the towering peaks of the Karakoram to the serene valleys of Kashmir — 
                explore diverse landscapes, rich culture, and unforgettable adventures across Pakistan.
              </p>

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
              Choose a category to discover destinations and hidden gems — each offering 
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
                const img = category.image || fallbackImage
                return (
                  <Link
                    key={category.id}
                    href={`/places/${category.slug}`}
                    className="places-category-card"
                  >
                    <div className="places-category-card__image">
                      <img src={cloudinaryImg(img, { width: 800 })} alt={`${category.name} — places to visit and tour`} loading="lazy" width="800" height="600" />
                      <div className="places-category-card__badge">
                        {category.destinationCount} {category.destinationCount === 1 ? 'place' : 'places'}
                      </div>
                    </div>
                    <div className="places-category-card__body">
                      <h3 className="places-category-card__name">{category.name}</h3>
                      {category.description && (
                        <p className="places-category-card__desc">{category.description}</p>
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
