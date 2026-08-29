import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCategoryBySlug } from '@/lib/db'
import { HERO_IMAGE } from '@/lib/initialData'

export const revalidate = 300

export async function generateMetadata({ params }) {
  const { categorySlug } = await params
  const category = await getCategoryBySlug(categorySlug)
  if (!category) return { title: 'Category Not Found — Pehchaan Travels' }
  return {
    title: `${category.name} — Pehchaan Travels`,
    description: category.description || `Explore destinations in ${category.name}, Pakistan`,
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
        className="places-hero places-hero--category"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      >
        <div className="places-hero__overlay">
          <div className="container">
            <div className="places-hero__breadcrumb">
              <Link href="/places">Places</Link>
              <span>/</span>
              <span>{category.name}</span>
            </div>
            <div className="places-hero__content">
              <h1 className="places-hero__title">{category.name}</h1>
              {category.description && (
                <p className="places-hero__subtitle">{category.description}</p>
              )}
              <div className="places-hero__stats">
                <div className="places-hero__stat">
                  <span className="places-hero__stat-num">{category.children.length}</span>
                  <span className="places-hero__stat-label">
                    {category.children.length === 1 ? 'Subcategory' : 'Subcategories'}
                  </span>
                </div>
                <div className="places-hero__stat">
                  <span className="places-hero__stat-num">{category.destinationCount}</span>
                  <span className="places-hero__stat-label">
                    {category.destinationCount === 1 ? 'Destination' : 'Destinations'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subcategories Section */}
      <section className="section places-subcategories">
        <div className="container">
          <div className="places-section-header">
            <h2 className="places-section-header__title">
              Explore {category.name}
            </h2>
            <p className="places-section-header__subtitle">
              Choose a subcategory to discover destinations within {category.name}
            </p>
          </div>
          {category.children.length > 0 ? (
            <div className="places-subcategories__grid">
              {category.children.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/places/${category.slug}/${sub.slug}`}
                  className="places-subcategory-card places-subcategory-card--link"
                >
                  <div className="places-subcategory-card__icon">📂</div>
                  <h3 className="places-subcategory-card__name">{sub.name}</h3>
                  <p className="places-subcategory-card__count">
                    {sub.destinationCount} {sub.destinationCount === 1 ? 'destination' : 'destinations'}
                  </p>
                  {sub.description && (
                    <p className="places-subcategory-card__desc">{sub.description}</p>
                  )}
                  <span className="places-subcategory-card__cta">
                    Explore {sub.name} →
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="places-empty">
              <p>No subcategories available in {category.name} yet.</p>
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
