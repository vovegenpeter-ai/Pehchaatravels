'use client'

/**
 * Analytics consent store.
 *
 * There is no permissive fallback: unless the visitor explicitly chose
 * "Allow analytics" (stored as `granted`), the state is `unknown` and session
 * replay stays off. Declining or withdrawing stores `denied`, which stops
 * recording and opts capturing out. A blocked/absent localStorage also reads
 * as `unknown`, never as consent.
 */

const STORAGE_KEY = 'pehchaan_analytics_consent'
const CHANGE_EVENT = 'pehchaan:analytics-consent'

export const CONSENT_GRANTED = 'granted'
export const CONSENT_DENIED = 'denied'
export const CONSENT_UNKNOWN = 'unknown'

function normalizeConsent(value) {
  return value === CONSENT_GRANTED || value === CONSENT_DENIED ? value : CONSENT_UNKNOWN
}

function isBrowser() {
  return typeof window !== 'undefined'
}

/** Current consent state: 'granted' | 'denied' | 'unknown'. */
export function readConsent() {
  if (!isBrowser()) return CONSENT_UNKNOWN
  try {
    return normalizeConsent(window.localStorage.getItem(STORAGE_KEY))
  } catch {
    return CONSENT_UNKNOWN
  }
}

function writeConsent(next) {
  const value = normalizeConsent(next)
  if (value === CONSENT_UNKNOWN || !isBrowser()) return CONSENT_UNKNOWN
  try {
    window.localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // Storage unavailable: keep the in-memory event so this visit still stops.
  }
  try {
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { consent: value } }))
  } catch {
    /* never break the page */
  }
  return value
}

export function grantAnalyticsConsent() {
  return writeConsent(CONSENT_GRANTED)
}

export function denyAnalyticsConsent() {
  return writeConsent(CONSENT_DENIED)
}

/** Withdrawal of analytics consent also stops session replay. */
export function withdrawAnalyticsConsent() {
  return writeConsent(CONSENT_DENIED)
}

/** Subscribe to consent changes; returns an unsubscribe function. */
export function subscribeConsent(listener) {
  if (!isBrowser() || typeof listener !== 'function') return () => {}
  const onChange = (event) =>
    listener(normalizeConsent(event?.detail?.consent ?? readConsent()))
  const onStorage = (event) => {
    if (event.key === STORAGE_KEY) listener(readConsent())
  }
  window.addEventListener(CHANGE_EVENT, onChange)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange)
    window.removeEventListener('storage', onStorage)
  }
}

/** Consent source injected into the replay controller. */
export const consentSource = {
  read: readConsent,
  subscribe: subscribeConsent,
}
