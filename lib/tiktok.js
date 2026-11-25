'use client'

/**
 * TikTok Pixel loader and event forwarder.
 *
 * The pixel ID below is the site's TikTok Pixel, so the pixel works without
 * any environment setup; NEXT_PUBLIC_TIKTOK_PIXEL_ID overrides it (set it to a
 * different ID, or to an empty-but-present value is still the built-in one).
 *
 * Mirrors components/seo/Analytics.jsx but is stricter: the pixel is only
 * injected after the visitor grants analytics consent (see lib/consent.js), so
 * no TikTok cookie is written before that choice.
 *
 * The queue shim below is the documented TikTok base code (`ttq.load` +
 * `ttq.page`), written out so it can be called from a React effect instead of
 * a raw inline <script> in the header.
 */

import { CONSENT_GRANTED, readConsent } from './consent'

const SCRIPT_SRC = 'https://analytics.tiktok.com/i18n/pixel/events.js'
const SCRIPT_ID = 'tiktok-pixel-sdk'

const QUEUE_METHODS = [
  'page',
  'track',
  'identify',
  'instances',
  'debug',
  'on',
  'off',
  'once',
  'ready',
  'alias',
  'group',
  'enableCookie',
  'disableCookie',
  'holdConsent',
  'revokeConsent',
  'grantConsent',
]

/** The site's TikTok Pixel ID (TikTok Ads Manager → Assets → Events → Web). */
const DEFAULT_PIXEL_ID = 'DC3JSVJC77U703IGKRCG'

export const TIKTOK_PIXEL_ID = (
  process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || DEFAULT_PIXEL_ID
).trim()

let installed = false

/** Give the plain `ttq` array the same method shims as TikTok's base snippet. */
function upgradeQueue(ttq) {
  ttq.methods = QUEUE_METHODS
  ttq.setAndDefer = (target, method) => {
    target[method] = function () {
      target.push([method].concat(Array.prototype.slice.call(arguments, 0)))
    }
  }
  QUEUE_METHODS.forEach((method) => ttq.setAndDefer(ttq, method))

  ttq.instance = (id) => {
    const instance = (ttq._i && ttq._i[id]) || []
    QUEUE_METHODS.forEach((method) => ttq.setAndDefer(instance, method))
    return instance
  }

  ttq.load = (id, options) => {
    ttq._i = ttq._i || {}
    ttq._i[id] = []
    ttq._i[id]._u = SCRIPT_SRC
    ttq._t = ttq._t || {}
    ttq._t[id] = +new Date()
    ttq._o = ttq._o || {}
    ttq._o[id] = options || {}

    if (document.getElementById(SCRIPT_ID)) return
    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.type = 'text/javascript'
    script.async = true
    script.src = `${SCRIPT_SRC}?sdkid=${encodeURIComponent(id)}&lib=ttq`
    const first = document.getElementsByTagName('script')[0]
    if (first && first.parentNode) first.parentNode.insertBefore(script, first)
    else document.head.appendChild(script)
  }
}

/**
 * Install the pixel if it is configured, consent is granted and it has not been
 * installed yet. Returns whether the pixel is usable afterwards.
 */
export function ensureTikTokPixel() {
  if (typeof window === 'undefined' || !TIKTOK_PIXEL_ID) return false
  if (readConsent() !== CONSENT_GRANTED) return false
  if (installed) return true

  window.TiktokAnalyticsObject = 'ttq'
  const ttq = (window.ttq = window.ttq || [])
  upgradeQueue(ttq)
  ttq.load(TIKTOK_PIXEL_ID)
  installed = true
  return true
}

/** Send a PageView for the current URL (call on every client-side route change). */
export function trackTikTokPage() {
  if (!ensureTikTokPixel()) return
  try {
    window.ttq.page()
  } catch {
    /* analytics must never break navigation */
  }
}

/**
 * Send a TikTok event. Standard event names such as `AddToCart` or
 * `InitiateCheckout` are expected; arbitrary properties are allowed.
 */
export function trackTikTokEvent(eventName, properties = {}) {
  if (!eventName || typeof window === 'undefined') return
  if (readConsent() !== CONSENT_GRANTED) return
  if (!ensureTikTokPixel()) return
  try {
    window.ttq.track(eventName, properties)
  } catch {
    /* analytics must never break the user flow */
  }
}

/** Withdrawing consent stops the pixel's first-party cookie writes. */
export function disableTikTokCookies() {
  if (typeof window === 'undefined') return
  const ttq = window.ttq
  if (!ttq || typeof ttq.disableCookie !== 'function') return
  try {
    ttq.disableCookie()
  } catch {
    /* noop */
  }
}
