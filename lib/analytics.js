'use client'

/**
 * Conversion event helper.
 *
 * Every event is forwarded to each configured destination:
 *
 * - GA4 (`NEXT_PUBLIC_GA_MEASUREMENT_ID`) via `gtag`, using the recommended
 *   GA4 event names so no custom event setup is required in the GA interface.
 * - TikTok Pixel (lib/tiktok.js) using TikTok's *standard* event names and
 *   documented parameter names, so Events Manager reports them without any
 *   manual event configuration.
 * - Meta Pixel (lib/metaPixel.js) using Meta's standard events and documented
 *   parameters, for Facebook & Instagram ads.
 *
 * All are safe no-ops when nothing is configured, and all stay silent until
 * the visitor grants analytics consent.
 *
 * TikTok reference: https://ads.tiktok.com/help/article/standard-events-parameters
 * Meta reference:  https://developers.facebook.com/docs/meta-pixel/reference
 */

import { createEventId, trackTikTokEvent } from '@/lib/tiktok'
import { createMetaEventId, trackMetaEvent } from '@/lib/metaPixel'

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''
const CURRENCY = 'PKR'
const COUNTRY = 'Pakistan'

function trackGA(eventName, params) {
  if (!GA_ID || typeof window === 'undefined') return
  const gtag = window.gtag
  if (typeof gtag !== 'function') return
  try {
    gtag('event', eventName, params)
  } catch {
    /* analytics must never break the user flow */
  }
}

/** Drop empty values so TikTok does not receive `undefined` properties. */
function clean(params) {
  const out = {}
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    out[key] = value
  }
  return out
}

/**
 * TikTok's line-item format. `contents` is the documented way to send more
 * than one booked tour with its own price and quantity.
 */
function toContents(items) {
  return (items || [])
    .map((item) => ({
      content_id: String(item.content_id ?? item.id ?? item.slug ?? ''),
      content_name: item.content_name ?? item.name ?? item.tourName,
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
    }))
    .filter((item) => item.content_id)
}

/**
 * TikTok's "Content ID is missing" diagnostic counts events without a
 * top-level `content_id`. Multi-item events still carry the full list in
 * `contents`, so the first booked tour is reported as the primary content.
 */
function primaryContentId(items) {
  const ids = (items || [])
    .map((item) => String(item.content_id ?? item.id ?? item.slug ?? ''))
    .filter(Boolean)
  return ids.length ? ids[0] : undefined
}

function num(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

/* ── Travel location parameters ───────────────────────────────────────────
   TikTok's travel-vertical diagnostics require location parameters on the
   funnel events, and `Purchase` specifically requires `city` and `country`
   (region is recommended). Every tour, hotel and destination on this site is
   in Pakistan, so the country is fixed; the city is the record's own
   destination/location name rather than anything guessed from the URL.
   https://ads.tiktok.com/help/article/available-events-and-parameters-for-travel-ads */

function travelLocation(source = {}) {
  const city = source.city || source.destination || source.location
  const region = source.region
  return {
    city: city ? String(city).trim() || undefined : undefined,
    region: region ? String(region).trim() || undefined : undefined,
    country: COUNTRY,
  }
}

/** Location of the first booked item, used on the cart-wide events. */
function primaryLocation(items) {
  return travelLocation((items || [])[0] || {})
}

/* ── Purchase deduplication ───────────────────────────────────────────────
   A booking can reach the client twice (double submit, retried request, the
   same order returned by the duplicate-booking guard). TikTok only merges
   events that carry the same `event_id`, so the order ID is used as the key
   and recent IDs are remembered for this browser session. */

const PURCHASE_KEY = 'pehchaan_tiktok_purchases'

function alreadySentPurchase(orderId) {
  if (typeof window === 'undefined' || !orderId) return false
  try {
    const raw = window.sessionStorage.getItem(PURCHASE_KEY)
    const sent = raw ? JSON.parse(raw) : []
    return Array.isArray(sent) && sent.includes(String(orderId))
  } catch {
    return false
  }
}

function rememberPurchase(orderId) {
  if (typeof window === 'undefined' || !orderId) return
  try {
    const raw = window.sessionStorage.getItem(PURCHASE_KEY)
    const sent = raw ? JSON.parse(raw) : []
    const next = (Array.isArray(sent) ? sent : []).concat(String(orderId)).slice(-20)
    window.sessionStorage.setItem(PURCHASE_KEY, JSON.stringify(next))
  } catch {
    /* storage unavailable — the event_id still dedupes on TikTok's side */
  }
}

/**
 * Maps the site's internal events to TikTok standard events.
 * https://ads.tiktok.com/help/article/standard-events-parameters
 *
 * Each mapper returns { name, properties, options }.
 */
const TIKTOK_EVENTS = {
  /* A tour, hotel or destination detail page was opened. */
  view_content: (p) => ({
    name: 'ViewContent',
    properties: {
      /* Travel content types are `hotel` / `flight` / `destination`. */
      content_type: p.content_type || 'destination',
      ...travelLocation(p),
      content_category: p.content_category,
      content_id: p.content_id ? String(p.content_id) : undefined,
      content_ids: p.content_id ? [String(p.content_id)] : undefined,
      content_name: p.content_name,
      contents: p.content_id
        ? [{ content_id: String(p.content_id), content_name: p.content_name, price: num(p.value), quantity: 1 }]
        : undefined,
      value: num(p.value),
      currency: p.value != null ? CURRENCY : undefined,
      description: p.description,
    },
  }),

  /* In-site search. TikTok expects the typed query in `search_string`. */
  search: (p) => ({
    name: 'Search',
    properties: {
      search_string: p.search_term,
      content_type: 'product',
      content_category: p.search_area,
      content_id: `${p.search_area || 'site'}-search`,
      content_name: `Search: ${p.search_area || 'site'}`,
    },
  }),

  add_to_cart: (p) => ({
    name: 'AddToCart',
    properties: {
      content_type: 'destination',
      ...travelLocation(p),
      content_category: 'Tour Package',
      content_id: p.content_id ? String(p.content_id) : undefined,
      content_ids: p.content_id ? [String(p.content_id)] : undefined,
      content_name: p.content_name,
      contents: p.content_id
        ? [{
            content_id: String(p.content_id),
            content_name: p.content_name,
            price: num(p.value),
            quantity: 1,
          }]
        : undefined,
      value: num(p.value),
      currency: CURRENCY,
      quantity: 1,
    },
  }),

  begin_checkout: (p) => ({
    name: 'InitiateCheckout',
    properties: {
      content_type: 'destination',
      ...primaryLocation(p.items),
      content_category: 'Tour Package',
      content_id: primaryContentId(p.items),
      contents: toContents(p.items),
      content_ids: (p.items || []).map((i) => String(i.content_id ?? i.id ?? '')).filter(Boolean),
      value: num(p.value),
      currency: CURRENCY,
      quantity: num(p.num_items),
    },
  }),

  /* A payment method was chosen on the checkout payment step. */
  add_payment_info: (p) => ({
    name: 'AddPaymentInfo',
    properties: {
      content_type: 'destination',
      ...primaryLocation(p.items),
      content_category: 'Payment Method',
      content_name: p.payment_method,
      content_id: primaryContentId(p.items),
      contents: toContents(p.items),
      value: num(p.value),
      currency: CURRENCY,
    },
  }),

  /* The booking was created and stored — the site's conversion. */
  purchase: (p) => ({
    name: 'Purchase',
    properties: {
      content_type: 'destination',
      ...primaryLocation(p.items),
      content_category: 'Tour Package',
      content_id: primaryContentId(p.items),
      contents: toContents(p.items),
      content_ids: (p.items || []).map((i) => String(i.content_id ?? i.id ?? '')).filter(Boolean),
      content_name: p.content_name,
      value: num(p.value),
      currency: CURRENCY,
      quantity: num(p.num_items),
      description: p.payment_type ? `Payment method: ${p.payment_type}` : undefined,
    },
    options: { event_id: createEventId(p.order_id) },
  }),

  /* Lead forms: contact page and custom trip request. */
  generate_lead: (p) => ({
    name: 'SubmitForm',
    properties: {
      content_type: 'product',
      content_category: 'Lead',
      content_name: p.form_location,
      content_id: p.method,
      description: p.detail,
      value: num(p.value),
      currency: p.value != null ? CURRENCY : undefined,
    },
  }),

  /* Direct contact: WhatsApp clicks and phone-call clicks. */
  whatsapp_click: (p) => ({
    name: 'Contact',
    properties: {
      content_type: 'product',
      content_category: 'WhatsApp',
      content_name: 'WhatsApp',
      content_id: p.location,
    },
  }),

  phone_click: (p) => ({
    name: 'Contact',
    properties: {
      content_type: 'product',
      content_category: 'Phone Call',
      content_name: 'Phone Call',
      content_id: p.location,
      description: p.phone,
    },
  }),

  sign_up: (p) => ({
    name: 'CompleteRegistration',
    properties: {
      content_type: 'product',
      content_category: 'Account',
      content_name: 'Account created',
      content_id: p.method,
    },
  }),

  newsletter_subscribe: () => ({
    name: 'Subscribe',
    properties: {
      content_type: 'product',
      content_category: 'Newsletter',
      content_name: 'Newsletter',
      content_id: 'newsletter',
    },
  }),

  /* A "Contact Us" button or email link was clicked. */
  contact_click: (p) => ({
    name: 'Contact',
    properties: {
      content_type: 'product',
      content_category: p.channel || 'Contact',
      content_name: 'Contact',
      content_id: p.location,
    },
  }),
}

function trackTikTok(eventName, params) {
  const mapper = TIKTOK_EVENTS[eventName]
  if (!mapper) return
  const mapped = mapper(params || {})
  if (!mapped) return
  const { name, properties, options } = mapped
  trackTikTokEvent(name, clean(properties), options)
}

/* ── Meta Pixel ───────────────────────────────────────────────────────────
   Meta uses different parameter names than TikTok: line items are
   `contents: [{ id, quantity, item_price }]`, the product identifiers are
   `content_ids`, and the event de-duplication key is `eventID`.
   https://developers.facebook.com/docs/meta-pixel/reference

   Nothing personal is ever sent: these mappers whitelist product/funnel data
   only, so a phone number or email held in another payload cannot leak. */

/** Meta's line-item format. */
function toMetaContents(items) {
  return (items || [])
    .map((item) => ({
      id: String(item.content_id ?? item.id ?? item.slug ?? ''),
      quantity: Number(item.quantity) || 1,
      item_price: Number(item.price) || 0,
    }))
    .filter((item) => item.id)
}

function metaContentIds(items) {
  return (items || [])
    .map((item) => String(item.content_id ?? item.id ?? item.slug ?? ''))
    .filter(Boolean)
}

const META_EVENTS = {
  /* A tour, hotel or destination detail page was opened. */
  view_content: (p) => ({
    name: 'ViewContent',
    params: {
      content_type: 'product',
      content_ids: p.content_id ? [String(p.content_id)] : undefined,
      content_name: p.content_name,
      content_category: p.content_category,
      value: num(p.value),
      currency: p.value != null ? CURRENCY : undefined,
    },
  }),

  /* In-site search — Meta expects the typed query in `search_string`. */
  search: (p) => ({
    name: 'Search',
    params: {
      search_string: p.search_term,
      content_category: p.search_area,
      content_type: 'product',
    },
  }),

  begin_checkout: (p) => ({
    name: 'InitiateCheckout',
    params: {
      content_type: 'product',
      content_category: 'Tour Package',
      content_ids: metaContentIds(p.items),
      contents: toMetaContents(p.items),
      num_items: num(p.num_items),
      value: num(p.value),
      currency: CURRENCY,
    },
  }),

  /* The booking was created and stored — the site's conversion. */
  purchase: (p) => ({
    name: 'Purchase',
    params: {
      content_type: 'product',
      content_category: 'Tour Package',
      content_ids: metaContentIds(p.items),
      contents: toMetaContents(p.items),
      content_name: p.content_name,
      num_items: num(p.num_items),
      value: num(p.value),
      currency: CURRENCY,
    },
    options: { eventID: createMetaEventId(p.order_id) },
  }),

  /* Contact form and custom trip request, sent only after the API succeeded. */
  generate_lead: (p) => ({
    name: 'Lead',
    params: {
      content_type: 'product',
      content_category: 'Lead',
      content_name: p.form_location,
      content_ids: p.method ? [String(p.method)] : undefined,
    },
  }),

  /* Direct contact: WhatsApp and phone-call clicks. */
  whatsapp_click: (p) => ({
    name: 'Contact',
    params: {
      content_type: 'product',
      content_category: 'WhatsApp',
      content_name: 'WhatsApp',
      content_ids: p.location ? [String(p.location)] : undefined,
    },
  }),

  phone_click: (p) => ({
    name: 'Contact',
    params: {
      content_type: 'product',
      content_category: 'Phone Call',
      content_name: 'Phone Call',
      content_ids: p.location ? [String(p.location)] : undefined,
    },
  }),

  contact_click: (p) => ({
    name: 'Contact',
    params: {
      content_type: 'product',
      content_category: p.channel || 'Contact',
      content_name: 'Contact',
      content_ids: p.location ? [String(p.location)] : undefined,
    },
  }),

  sign_up: (p) => ({
    name: 'CompleteRegistration',
    params: {
      content_name: 'Account created',
      content_category: 'Account',
      status: true,
    },
  }),

  newsletter_subscribe: () => ({
    name: 'Subscribe',
    params: {
      content_name: 'Newsletter',
      content_category: 'Newsletter',
    },
  }),
}

function trackMeta(eventName, params) {
  const mapper = META_EVENTS[eventName]
  if (!mapper) return
  const mapped = mapper(params || {})
  if (!mapped) return
  trackMetaEvent(mapped.name, clean(mapped.params), mapped.options)
}

/**
 * Fire a conversion event. Safe to call from any client component.
 *
 * @param {string} eventName  Internal event name (see EVENTS)
 * @param {object} [params]   Event parameters
 */
export function trackEvent(eventName, params = {}) {
  if (eventName === EVENTS.purchase) {
    const orderId = params.order_id
    if (orderId && alreadySentPurchase(orderId)) return
    trackGA(eventName, params)
    trackTikTok(eventName, params)
    trackMeta(eventName, params)
    if (orderId) rememberPurchase(orderId)
    return
  }
  trackGA(eventName, params)
  trackTikTok(eventName, params)
  trackMeta(eventName, params)
}

/** Shorthand for the detail-page ViewContent event. */
export function trackViewContent({ id, name, type, category, city, region, value, description }) {
  trackEvent(EVENTS.viewContent, {
    content_id: id,
    content_name: name,
    content_type: type,
    content_category: category,
    city,
    region,
    value,
    description,
  })
}

/** Shorthand for the in-site search event. */
export function trackSearch(searchTerm, searchArea = 'site') {
  const term = (searchTerm || '').trim()
  if (!term) return
  trackEvent(EVENTS.search, { search_term: term, search_area: searchArea })
}

/** Named conversion events used across the site. */
export const EVENTS = {
  viewContent: 'view_content',
  search: 'search',
  addToCart: 'add_to_cart',
  beginCheckout: 'begin_checkout',
  addPaymentInfo: 'add_payment_info',
  purchase: 'purchase',
  whatsappClick: 'whatsapp_click',
  phoneClick: 'phone_click',
  contactClick: 'contact_click',
  contactSubmit: 'generate_lead',
  tripRequestSubmit: 'generate_lead',
  signUp: 'sign_up',
  newsletterSubscribe: 'newsletter_subscribe',
}
