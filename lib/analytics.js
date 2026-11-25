'use client'

/**
 * Lightweight conversion event helper.
 *
 * Each event is forwarded to every configured destination:
 *
 * - GA4 (`NEXT_PUBLIC_GA_MEASUREMENT_ID`) via `gtag`, using the recommended
 *   GA4 event names so no custom event setup is required in the GA interface.
 * - TikTok Pixel (`NEXT_PUBLIC_TIKTOK_PIXEL_ID`) via lib/tiktok.js, mapped to
 *   TikTok standard events. It stays silent until the visitor grants consent.
 *
 * Both are safe no-ops when their ID is missing, so booking, contact and
 * WhatsApp flows keep working unchanged until the owner configures a pixel.
 */

import { trackTikTokEvent } from '@/lib/tiktok'

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''

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
 * Maps the site's internal events to TikTok standard events.
 * https://business-api.tiktok.com/portal/docs?id=1739585173603329
 */
const TIKTOK_EVENTS = {
  whatsapp_click: (p) => [
    'Contact',
    { content_type: 'contact', content_name: 'WhatsApp', content_id: p.location },
  ],
  generate_lead: (p) => [
    'SubmitForm',
    { content_type: 'form', content_name: p.form_location, content_id: p.method },
  ],
  add_to_cart: (p) => [
    'AddToCart',
    {
      content_type: 'product',
      content_name: p.item_name,
      content_id: p.item_destination,
      value: p.value,
      currency: p.currency,
      quantity: 1,
    },
  ],
  begin_checkout: (p) => [
    'InitiateCheckout',
    {
      content_type: 'product',
      value: p.value,
      currency: p.currency,
      quantity: p.num_items,
    },
  ],
  purchase: (p) => [
    'CompletePayment',
    {
      content_type: 'product',
      value: p.value,
      currency: p.currency,
      quantity: p.num_items,
      order_id: p.transaction_id,
    },
  ],
  sign_up: () => ['CompleteRegistration', { content_type: 'account' }],
  newsletter_subscribe: () => ['Subscribe', { content_type: 'newsletter' }],
}

function trackTikTok(eventName, params) {
  const mapping = TIKTOK_EVENTS[eventName]
  if (!mapping) return
  const [tiktokEvent, properties] = mapping(params || {})
  trackTikTokEvent(tiktokEvent, clean(properties))
}

/**
 * Fire a conversion event. Safe to call from any client component.
 *
 * @param {string} eventName  GA4 event name, e.g. 'generate_lead'
 * @param {object} [params]   Event parameters
 */
export function trackEvent(eventName, params = {}) {
  trackGA(eventName, params)
  trackTikTok(eventName, params)
}

/** Named conversion events used across the site. */
export const EVENTS = {
  whatsappClick: 'whatsapp_click',
  contactSubmit: 'generate_lead',
  tripRequestSubmit: 'generate_lead',
  addToCart: 'add_to_cart',
  beginCheckout: 'begin_checkout',
  purchase: 'purchase',
  signUp: 'sign_up',
  newsletterSubscribe: 'newsletter_subscribe',
}
