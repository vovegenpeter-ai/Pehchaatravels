import Link from 'next/link'
import { notFound } from 'next/navigation'
import PlaceCard from '@/components/PlaceCard'
import { getSubcategoryBySlug } from '@/lib/db'
import { HERO_IMAGE } from '@/lib/initialData'

export const revalidate = 300

export async function generateMetadata({ params }) {
  const { categorySlug, subcategorySlug } = await params
  const subcategory = await getSubcategoryBySlug(categorySlug, subcategorySlug)
  if (!subcategory) return { title: 'Subcategory Not Found — Pehchaan Travels' }
  return {
    title: `${subcategory.name} — Pehchaan Travels`,
    description: subcategory.description || `Explore destinations in ${subcategory.name}, ${subcategory.parent.name}`,
  }
}

export default async function SubcategoryPage({ params }) {
  const { categorySlug, subcategorySlug } = await params
  const subcategory = await getSubcategoryBySlug(categorySlug, subcategorySlug)
  if (!subcategory) notFound()

  const { parent, destinations } = subcategory

  return (
    <>
      {/* Hero Section */}
      <section
        className="places-hero places-hero--subcategory"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      >
        <div className="places-hero__overlay">
          <div className="container">
            <div className="places-hero__breadcrumb">
              <Link href="/places">Places</Link>
              <span>/</span>
              <Link href={`/places/${parent.slug}`}>{parent.name}</Link>
              <span>/</span>
              <span>{subcategory.name}</span>
            </div>
            <div className="places-hero__content">
              <h1 className="places-hero__title">{subcategory.name}</h1>
              {subcategory.description && (
                <p className="places-hero__subtitle">{subcategory.description}</p>
              )}
              <div className="places-hero__stats">
                <div className="places-hero__stat">
                  <span className="places-hero__stat-num">{destinations.length}</span>
                  <span className="places-hero__stat-label">
                    {destinations.length === 1 ? 'Destination' : 'Destinations'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <section className="section places-destinations">
        <div className="container">
          <div className="places-section-header">
            <h2 className="places-section-header__title">
              Destinations in {subcategory.name}
            </h2>
            <p className="places-section-header__subtitle">
              {destinations.length > 0
                ? `Discover ${destinations.length} amazing ${destinations.length === 1 ? 'place' : 'places'} in ${subcategory.name}`
                : `No destinations available in ${subcategory.name} yet`
              }
            </p>
          </div>
          {destinations.length > 0 ? (
            <div className="grid grid--3">
              {destinations.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          ) : (
            <div className="places-empty">
              <p>No destinations available in this subcategory yet. Check back soon!</p>
              <Link href={`/places/${parent.slug}`} className="btn btn--primary">
                Browse {parent.name}
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
