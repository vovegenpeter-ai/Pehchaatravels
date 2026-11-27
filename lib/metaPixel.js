'use client'

/**
 * Meta (Facebook & Instagram) Pixel loader and event forwarder.
 *
 * The Pixel ID comes from `NEXT_PUBLIC_META_PIXEL_ID` only. There is no
 * built-in default: until a real ID is configured nothing is injected and
 * every tracking call is a silent no-op, so the site keeps working exactly as
 * before.
 *
 * Like the TikTok pixel (lib/tiktok.js), the pixel is only injected after the
 * visitor grants analytics consent through the existing banner (lib/consent.js),
 * so no Meta cookie is written before that choice.
 *
 * The base code below is Meta's official snippet
 * (https://developers.facebook.com/docs/meta-pixel/get-started), reworked so
 * it can be called from a React effect instead of a raw inline <script> in the
 * document head. It is installed at most once per page load.
 */

import { CONSENT_GRANTED, readConsent } from './consent'

const SCRIPT_SRC = 'https://connect.facebook.net/en_US/fbevents.js'

/** The site's Meta Pixel ID (Meta Events Manager → Data sources → your pixel). */
export const META_PIXEL_ID = (process.env.NEXT_PUBLIC_META_PIXEL_ID || '').trim()

let installed = false

/**
 * Meta's documented base code. It defines `window.fbq` as a callable queue and
 * loads fbevents.js asynchronously. If something already installed `fbq` (for
 * example a snippet pasted into a template), the existing instance is reused so
 * the pixel is never initialised twice.
 */
function installBaseCode() {
  if (typeof window.fbq === 'function') return

  /* eslint-disable */
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
    }
    if (!f._fbq) f._fbq = n
    n.push = n
    n.loaded = !0
    n.version = '2.0'
    n.queue = []
    t = b.createElement(e)
    t.async = !0
    t.src = v
    s = b.getElementsByTagName(e)[0]
    if (s && s.parentNode) s.parentNode.insertBefore(t, s)
    else b.head.appendChild(t)
  })(window, document, 'script', SCRIPT_SRC)
  /* eslint-enable */
}

/**
 * Initialise the pixel if it is configured, consent is granted and it has not
 * been initialised yet. Returns whether the pixel is ready for events.
 */
export function ensureMetaPixel() {
  if (typeof window === 'undefined' || !META_PIXEL_ID) return false
  if (readConsent() !== CONSENT_GRANTED) return false
  if (installed) return true

  try {
    installBaseCode()
    /* Advanced Matching is intentionally left off: the site never sends
       hashed or raw personal data (email, phone) to Meta from the browser. */
    window.fbq('init', META_PIXEL_ID)
    installed = true
    return true
  } catch {
    return false
  }
}

/** Drop empty values so Meta does not receive `undefined` properties. */
function stripUndefined(params) {
  const out = {}
  for (const [key, value] of Object.entries(params || {})) {
    if (value === undefined || value === null || value === '') continue
    out[key] = value
  }
  return out
}

/**
 * Build a stable event ID for Meta's browser/server deduplication.
 * Events that share a pixel, event name and event ID are counted once.
 *
 * @param {string} [seed]
 * @returns {string}
 */
export function createMetaEventId(seed) {
  if (seed) return `pehchaan-meta-${String(seed).slice(0, 64)}`
  const rand =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  return `pehchaan-meta-${rand}`
}

/**
 * Send a `PageView` for the current URL. The App Router never reloads the
 * document, so this is called once on load and once per route change
 * (see components/seo/MetaPixel.jsx).
 *
 * @param {string} [eventId]
 * @returns {boolean}
 */
export function trackMetaPage(eventId) {
  if (!ensureMetaPixel()) return false
  try {
    if (eventId) window.fbq('track', 'PageView', {}, { eventID: eventId })
    else window.fbq('track', 'PageView')
    return true
  } catch {
    return false
  }
}

/**
 * Send a standard Meta Pixel event.
 *
 * Standard event names (`ViewContent`, `Search`, `Contact`, `Lead`,
 * `InitiateCheckout`, `Purchase`) are used so Events Manager reports them
 * without manual event configuration.
 *
 * @param {string} eventName    Meta standard event name
 * @param {Record<string, unknown>} [params]  Documented parameters only — never PII
 * @param {{ eventID?: string }} [options]
 * @returns {boolean}
 */
export function trackMetaEvent(eventName, params = {}, options = {}) {
  if (!eventName || typeof window === 'undefined') return false
  if (readConsent() !== CONSENT_GRANTED) return false
  if (!ensureMetaPixel()) return false

  try {
    const payload = stripUndefined(params)
    if (options && options.eventID) {
      window.fbq('track', eventName, payload, { eventID: options.eventID })
    } else {
      window.fbq('track', eventName, payload)
    }
    return true
  } catch {
    /* analytics must never break the user flow */
    return false
  }
}

/** Withdrawing consent revokes the pixel's cookie usage (Limited Data Use). */
export function disableMetaCookies() {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return
  try {
    window.fbq('consent', 'revoke')
  } catch {
    /* noop */
  }
}
