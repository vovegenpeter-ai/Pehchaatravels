import { getSitemapEntries } from '@/lib/db'
import { absoluteUrl } from '@/lib/seo'

/**
 * Dynamic XML sitemap.
 *
 * Static marketing pages are declared explicitly; tours, hotels, destinations
 * and place categories come from the database so new admin-published content
 * is picked up automatically without a redeploy.
 *
 * Only publicly indexable pages appear here — account, cart, checkout, admin
 * and API routes are excluded on purpose (see app/robots.js).
 */
export const revalidate = 3600

const STATIC_PAGES = [
  { path: '/', priority: '1.0', changeFrequency: 'daily' },
  { path: '/tours', priority: '0.9', changeFrequency: 'daily' },
  { path: '/places', priority: '0.8', changeFrequency: 'weekly' },
  { path: '/hotels', priority: '0.8', changeFrequency: 'weekly' },
  { path: '/make-my-trip', priority: '0.8', changeFrequency: 'weekly' },
  { path: '/faqs', priority: '0.6', changeFrequency: 'monthly' },
  { path: '/about', priority: '0.5', changeFrequency: 'yearly' },
  { path: '/contact', priority: '0.6', changeFrequency: 'monthly' },
  { path: '/terms', priority: '0.3', changeFrequency: 'yearly' },
  { path: '/privacy', priority: '0.3', changeFrequency: 'yearly' },
]

export default async function sitemap() {
  const { tours, hotels, destinations, categories } = await getSitemapEntries()

  const staticEntries = STATIC_PAGES.map(({ path, priority, changeFrequency }) => ({
    url: absoluteUrl(path),
    changeFrequency,
    priority,
  }))

  const tourEntries = tours.map((tour) => ({
    url: absoluteUrl(`/tours/${tour.slug}`),
    lastModified: tour.updatedAt,
    changeFrequency: 'weekly',
    priority: '0.9',
  }))

  const destinationEntries = destinations.map((place) => ({
    url: absoluteUrl(`/destinations/${place.slug}`),
    lastModified: place.updatedAt,
    changeFrequency: 'weekly',
    priority: '0.8',
  }))

  const categoryEntries = categories.map((category) => ({
    url: absoluteUrl(`/places/${category.slug}`),
    lastModified: category.updatedAt,
    changeFrequency: 'weekly',
    priority: '0.7',
  }))

  const hotelEntries = hotels.map((hotel) => ({
    url: absoluteUrl(`/hotels/${hotel.slug}`),
    lastModified: hotel.updatedAt,
    changeFrequency: 'weekly',
    priority: '0.7',
  }))

  return [
    ...staticEntries,
    ...tourEntries,
    ...destinationEntries,
    ...categoryEntries,
    ...hotelEntries,
  ]
}
