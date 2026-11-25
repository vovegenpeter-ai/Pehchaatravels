import { SITE_URL } from '@/lib/seo'

/** SEO-safe crawler policy. Sitemap is declared here so crawlers always find it. */
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // Private / account areas — no index value, wastes crawl budget
          '/admin',
          '/api/',
          '/cart',
          '/checkout',
          '/profile',
          '/bookings',
          '/sign-in',
          '/sign-up',
          '/forgot-password',
          '/reset-password',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
