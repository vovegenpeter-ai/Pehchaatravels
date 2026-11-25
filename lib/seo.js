/**
 * Central SEO configuration for Pehchaan Travels.
 *
 * Single source of truth for the canonical origin, brand strings and the
 * metadata / JSON-LD builders used across the app.
 *
 * IMPORTANT: Never invent business data here. Only values that already exist
 * in the app (see lib/initialData.js) may be added. Fields we cannot verify
 * (e.g. a postal address) are deliberately left out and flagged in the SEO
 * report instead of being guessed.
 */

import { PHONE_NUMBER, EMAIL } from '@/lib/initialData'

/**
 * Canonical production origin.
 *
 * NEXT_PUBLIC_SITE_URL exists specifically for SEO so canonical / Open Graph
 * URLs always point at the public domain. It is separate from
 * NEXT_PUBLIC_APP_URL (used for email links), which currently still points at
 * the Vercel deployment URL and must not be used for canonicals.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://pehchaantravels.pk'
).replace(/\/+$/, '')

export const SITE_NAME = 'Pehchaan Travels'
export const LOGO_URL = `${SITE_URL}/logo.png`

/** Build an absolute, origin-anchored URL from an app path. */
export function absoluteUrl(path = '/') {
  const p = String(path || '/').split('#')[0].split('?')[0]
  return `${SITE_URL}${p.startsWith('/') ? p : `/${p}`}`
}

/**
 * Business identity. Address is intentionally omitted: the site currently
 * states two different office locations, and structured data must never
 * guess. Confirm the real address, then add `address` here.
 */
export const BUSINESS = {
  '@type': 'TravelAgency',
  name: SITE_NAME,
  url: SITE_URL,
  logo: LOGO_URL,
  telephone: PHONE_NUMBER,
  email: EMAIL,
  slogan: 'Your trusted partner for exploring the unseen beauty of Pakistan.',
  areaServed: [
    { '@type': 'Country', name: 'Pakistan' },
    { '@type': 'City', name: 'Lahore' },
    { '@type': 'City', name: 'Islamabad' },
  ],
  knowsAbout: [
    'Northern Pakistan tours',
    'Hunza Valley',
    'Skardu',
    'Swat and Kalam',
    'Kashmir and Neelum Valley',
    'Kumrat Valley',
    'Gilgit-Baltistan travel',
    'customised tour packages',
  ],
}

export const DEFAULT_OG_IMAGE = `${SITE_URL}/make-my-trip-hero.jpg`

/** Trim and normalise copy so titles stay inside SERP-friendly lengths. */
function clamp(text, max) {
  const t = String(text || '').replace(/\s+/g, ' ').trim()
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t
}

/** Strip HTML tags (rich-text descriptions arrive as markup). */
export function stripHtml(html) {
  return String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Build the full Next.js metadata object for a public page.
 *
 * @param {object} opts
 * @param {string} opts.title        Title WITHOUT the brand suffix (the root
 *                                   layout appends " — Pehchaan Travels").
 * @param {string} opts.description  Meta description.
 * @param {string} [opts.path]       Canonical app path, e.g. '/tours'.
 * @param {string} [opts.image]      Absolute or relative OG image URL.
 * @param {string[]} [opts.keywords]
 * @param {boolean} [opts.noindex]   Set true for account/cart/checkout pages.
 * @param {string} [opts.type]       Open Graph type (default 'website').
 */
export function buildMetadata({
  title,
  description,
  path,
  image,
  keywords,
  noindex = false,
  type = 'website',
}) {
  const canonical = path ? absoluteUrl(path) : undefined
  const desc = clamp(description, 160)
  const ogImage = image
    ? image.startsWith('http')
      ? image
      : absoluteUrl(image)
    : DEFAULT_OG_IMAGE

  return {
    title: clamp(title, 45),
    description: desc,
    ...(keywords?.length ? { keywords } : {}),
    ...(canonical ? { alternates: { canonical } } : {}),
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title: clamp(`${title} — ${SITE_NAME}`, 70),
      description: desc,
      url: canonical || SITE_URL,
      siteName: SITE_NAME,
      type,
      images: [{ url: ogImage, width: 1200, height: 630, alt: clamp(title, 100) }],
      locale: 'en_PK',
    },
    twitter: {
      card: 'summary_large_image',
      title: clamp(`${title} — ${SITE_NAME}`, 70),
      description: desc,
      images: [ogImage],
    },
  }
}

/* ------------------------------------------------------------------ *
 * JSON-LD helpers
 * ------------------------------------------------------------------ */

/**
 * Render a JSON-LD object as a script tag.
 * `dangerouslySetInnerHTML` keeps React from escaping the JSON.
 */
export function jsonLdScript(data) {
  return JSON.stringify(data, (_key, value) =>
    typeof value === 'undefined' ? undefined : value
  )
}

/** BreadcrumbList schema from an array of { name, path } items. */
export function breadcrumbSchema(items = []) {
  const listItems = items
    .filter((i) => i && i.name)
    .map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.path ? { item: absoluteUrl(item.path) } : {}),
    }))

  if (listItems.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: listItems,
  }
}

/** Organization schema rendered on the homepage. */
export function organizationSchema({ sameAs = [] } = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    '@id': `${SITE_URL}/#organization`,
    ...BUSINESS,
    /* Reservations contact point. Declared once here rather than on the
       contact page too, so Google sees a single entity per page instead of
       two competing TravelAgency nodes. */
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: PHONE_NUMBER,
        contactType: 'reservations',
        areaServed: 'PK',
        availableLanguage: ['English', 'Urdu'],
      },
    ],
    ...(sameAs.length ? { sameAs } : {}),
  }
}

/**
 * FAQPage schema — only emitted when real question/answer pairs exist.
 * Google requires the visible page content to match the markup.
 */
export function faqPageSchema(faqs = []) {
  const clean = faqs
    .filter((f) => f && f.question && f.answer)
    .map((f) => ({
      name: stripHtml(f.question),
      acceptedAnswer: { text: clamp(stripHtml(f.answer), 1200) },
    }))

  if (clean.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: clean.map((f) => ({
      '@type': 'Question',
      name: f.name,
      acceptedAnswer: { '@type': 'Answer', text: f.acceptedAnswer },
    })),
  }
}

/**
 * AggregateRating schema — emitted ONLY when the tour actually has approved
 * reviews in the database. Never synthesise ratings: fake markup violates
 * Google's structured data policies.
 */
export function aggregateRatingSchema({ count = 0, average = 0, url }) {
  if (!count || !average) return null
  return {
    '@type': 'AggregateRating',
    ratingValue: Number(average).toFixed(1),
    reviewCount: String(count),
    bestRating: '5',
    worstRating: '1',
    ...(url ? { url } : {}),
  }
}
