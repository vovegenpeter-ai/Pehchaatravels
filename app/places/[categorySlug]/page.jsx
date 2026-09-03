import Link from 'next/link'
import { notFound } from 'next/navigation'
import PlaceCard from '@/components/PlaceCard'
import { getCategoryBySlug } from '@/lib/db'
import { HERO_IMAGE } from '@/lib/initialData'

export const revalidate = 60

export async function generateMetadata({ params }) {
  const { categorySlug } = await params
  const category = await getCategoryBySlug(categorySlug)
  if (!category) return { title: 'Category Not Found — Pehchaan Travels' }
  return {
    title: `${category.name} — Pehchaan Travels`,
    description: category.shortDescription || category.description || `Explore destinations in ${category.name}, Pakistan`,
  }
}

export default async function CategoryPage({ params }) {
  const { categorySlug } = await params
  const category = await getCategoryBySlug(categorySlug)
  if (!category) notFound()

  return (
    <>
      {/* Hero Section */}
      <section
        className="places-hero places-hero--category places-hero--no-overlay"
        style={{ backgroundImage: `url(${category.image || HERO_IMAGE})` }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="places-hero__content">
            <h1 className="places-hero__title">{category.name}</h1>
          </div>
        </div>
      </section>

      {/* Long Description Section */}
      {category.longDescription && (
        <section className="section" style={{ background: '#fff' }}>
          <div className="container" style={{ maxWidth: '800px' }}>
            <div
              className="tour-description"
              dangerouslySetInnerHTML={{ __html: category.longDescription }}
            />
          </div>
        </section>
      )}

      {/* Destinations Section */}
      <section className="section places-destinations">
        <div className="container">
          <div className="places-section-header">
            <h2 className="places-section-header__title">
              Destinations in {category.name}
            </h2>
            <p className="places-section-header__subtitle">
              {category.destinations.length > 0
                ? `Discover ${category.destinations.length} amazing ${category.destinations.length === 1 ? 'place' : 'places'} in ${category.name}`
                : `No destinations available in ${category.name} yet`
              }
            </p>
          </div>
          {category.destinations.length > 0 ? (
            <div className="grid grid--3">
              {category.destinations.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          ) : (
            <div className="places-empty">
              <p>No destinations available in this category yet. Check back soon!</p>
              <Link href="/places" className="btn btn--primary">
                Browse All Places
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
