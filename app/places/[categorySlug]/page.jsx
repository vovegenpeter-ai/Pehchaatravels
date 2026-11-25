import Link from 'next/link'
import { notFound } from 'next/navigation'
import PlaceCard from '@/components/PlaceCard'
import Breadcrumbs from '@/components/seo/Breadcrumbs'
import { getCategoryBySlug } from '@/lib/db'
import { HERO_IMAGE } from '@/lib/initialData'
import { cloudinaryImg } from '@/lib/cloudinaryUrl'
import { buildMetadata } from '@/lib/seo'

/** Title-case a category name for display (DB may store lowercase, e.g. "kashmir"). */
function formatCategoryName(name) {
  return (name || '')
    .split(/\s+/)
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ')
}

export const revalidate = 60

export async function generateMetadata({ params }) {
  const { categorySlug } = await params
  const category = await getCategoryBySlug(categorySlug)
  if (!category) return { title: 'Category Not Found' }

  const name = formatCategoryName(category.name)
  const blurb = category.shortDescription || category.description || ''

  return buildMetadata({
    title: `${name} — Places to Visit & Tour Packages`,
    description:
      `Explore the ${name} destinations we cover, with tour packages, itineraries and hotels for each place. ${blurb}`
        .replace(/\s+/g, ' ')
        .trim(),
    path: `/places/${category.slug}`,
    image: category.image,
    keywords: [
      `places to visit in ${name}`,
      `${name} tourist places`,
      `${name} tour package`,
      `${name} Pakistan travel`,
    ],
  })
}

export default async function CategoryPage({ params }) {
  const { categorySlug } = await params
  const category = await getCategoryBySlug(categorySlug)
  if (!category) notFound()

  const categoryName = formatCategoryName(category.name)

  return (
    <>
      <Breadcrumbs
        items={[
          { name: 'Home', path: '/' },
          { name: 'Places', path: '/places' },
          { name: categoryName },
        ]}
      />
      {/* Hero Section */}
      <section
        className="places-hero places-hero--category places-hero--no-overlay"
        style={{ backgroundImage: `url(${cloudinaryImg(category.image || HERO_IMAGE, { width: 1600 })})` }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="places-hero__content">
            <h1 className="places-hero__title">{categoryName}</h1>
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
              Destinations in {categoryName}
            </h2>
            <p className="places-section-header__subtitle">
              {category.destinations.length > 0
                ? `Discover the breathtaking destinations of ${formatCategoryName(category.name)}`
                : `No destinations available in ${formatCategoryName(category.name)} yet`
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
