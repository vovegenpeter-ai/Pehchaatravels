/**
 * Consent-gated PostHog session replay controller.
 *
 * Plain ESM with no SDK, framework or DOM imports at module scope, so Node can
 * import this exact file and drive it with stubs (see posthog-replay.check.mjs)
 * and the browser entry (instrumentation-client.ts) can mount the same code.
 *
 * Rules encoded here:
 *  - no project token or host ⇒ nothing is initialised and no listener is added;
 *  - a consent grant is the only thing that starts capture, via a plain
 *    `opt_in_capturing()` then `startSessionRecording()` (never `true`/options);
 *  - a fresh client is created opted out and with recording disabled, and every
 *    replay channel that DOM masking cannot cover (canvas, JSON-LD, network
 *    bodies/headers, console logs, performance) is switched off explicitly;
 *  - auth, payment, cart, booking and account routes are never recorded, and
 *    captured URLs lose their query string and fragment.
 */

/** Public env var holding the PostHog *project* token (never a personal key). */
export const TOKEN_ENV_KEY = 'NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN'

/** Public env var holding the PostHog ingestion host chosen by the owner. */
export const HOST_ENV_KEY = 'NEXT_PUBLIC_POSTHOG_HOST'

/** The only ingestion hosts this app accepts; there is no host fallback. */
export const ALLOWED_HOSTS = Object.freeze([
  'https://us.i.posthog.com',
  'https://eu.i.posthog.com',
])

/**
 * Path segments that must never appear in a replay: authentication, payment,
 * cart/checkout, bookings and account pages, admin, API routes and the lead
 * forms that collect names, phone numbers and free-text trip notes.
 */
export const SENSITIVE_PATH_SEGMENTS = Object.freeze([
  'account',
  'admin',
  'api',
  'auth',
  'bookings',
  'cart',
  'checkout',
  'contact',
  'forgot-password',
  'login',
  'logout',
  'make-my-trip',
  'order',
  'orders',
  'password',
  'payment',
  'payments',
  'profile',
  'reset-password',
  'sign-in',
  'sign-up',
  'signin',
  'signup',
])

/** Path words that point at a credential or session identifier. */
const SENSITIVE_WORDS = /(password|passwd|token|secret|api[-_]?key|session|otp|reset)/

/** Normalise a value into one of the three consent states we act on. */
export function normalizeConsent(value) {
  return value === 'granted' || value === 'denied' ? value : 'unknown'
}

/**
 * Resolve the PostHog project token and host from injected environment values.
 *
 * @param {Record<string, string | undefined>} [env]
 * @returns {{ token: string, host: string } | null} null ⇒ integration is a no-op
 */
export function resolveConfig(env = {}) {
  const rawToken = typeof env?.[TOKEN_ENV_KEY] === 'string' ? env[TOKEN_ENV_KEY].trim() : ''
  const rawHost = typeof env?.[HOST_ENV_KEY] === 'string' ? env[HOST_ENV_KEY].trim() : ''
  const host = rawHost.replace(/\/+$/, '')

  // Missing token/host is a no-op; a personal API key (phx_) must never ship.
  if (!rawToken || !host) return null
  if (rawToken.startsWith('phx_')) return null
  if (!ALLOWED_HOSTS.includes(host)) return null
  return { token: rawToken, host }
}

function parseHttpUrl(rawUrl, origin) {
  if (typeof rawUrl !== 'string') return null
  const value = rawUrl.trim()
  if (!value) return null
  if (/[\u0000-\u0020]/.test(value)) return null
  // Protocol-relative values silently switch hosts: drop them.
  if (value.startsWith('//')) return null

  const isAbsolute = /^[a-z][a-z0-9+.-]*:/i.test(value)
  if (!isAbsolute && !value.startsWith('/')) return null

  try {
    const base = typeof origin === 'string' && /^https?:\/\/[^/]+/i.test(origin) ? origin : undefined
    const parsed = isAbsolute ? new URL(value) : base ? new URL(value, base) : null
    if (!parsed) return null
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
    if (parsed.username || parsed.password) return null
    return parsed
  } catch {
    return null
  }
}

/** Reduce a route to its pathname, or null when it is not a usable http(s) URL. */
export function toPathname(urlOrPath, { origin } = {}) {
  const parsed = parseHttpUrl(urlOrPath, origin)
  if (!parsed) return null
  try {
    return decodeURIComponent(parsed.pathname)
  } catch {
    return parsed.pathname
  }
}

/** True when a route must never be captured (fail closed on unknown input). */
export function isSensitivePath(pathname) {
  if (typeof pathname !== 'string' || !pathname.trim()) return true
  const segments = pathname
    .toLowerCase()
    .split(/[/?#]+/)
    .filter(Boolean)
  if (segments.length === 0) return false
  return segments.some(
    (segment) => SENSITIVE_PATH_SEGMENTS.includes(segment) || SENSITIVE_WORDS.test(segment),
  )
}

/**
 * Strip the query string and fragment from a URL captured by replay, and drop
 * the request entirely when it is unparseable or points at a sensitive route.
 *
 * @param {unknown} rawUrl
 * @param {{ origin?: string }} [options]
 * @returns {string | null} safe absolute URL, or null when the request is dropped
 */
export function redactCapturedUrl(rawUrl, { origin } = {}) {
  const parsed = parseHttpUrl(rawUrl, origin)
  if (!parsed) return null
  if (isSensitivePath(parsed.pathname)) return null
  return `${parsed.origin}${parsed.pathname}`
}

/**
 * Build the PostHog init options. Everything a replay could leak is disabled
 * here rather than left to remote project defaults.
 *
 * @param {{ host: string, origin?: string }} options
 */
export function buildInitOptions({ host, origin } = {}) {
  return {
    api_host: host,
    opt_out_capturing_by_default: true,
    disable_session_recording: true,
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    capture_dead_clicks: false,
    rageclick: false,
    capture_exceptions: false,
    capture_heatmaps: false,
    capture_performance: false,
    enable_recording_console_log: false,
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: '*',
      // Blocking hides the whole subtree (text, attributes and images), which
      // text masking alone cannot do. `ph-no-capture` stays the opt-out class.
      blockClass: 'ph-no-capture',
      blockSelector: '[data-ph-block]',
      recordBody: false,
      recordHeaders: false,
      captureCanvas: { recordCanvas: false },
      captureJsonLd: false,
      /** Network requests: keep the origin and path, never the query/fragment. */
      maskCapturedNetworkRequestFn(request) {
        if (!request || typeof request !== 'object') return null
        const raw = typeof request.name === 'string' ? request.name : request.url
        const safe = redactCapturedUrl(raw, { origin })
        if (!safe) return null
        return { ...request, name: safe }
      },
    },
  }
}

/**
 * Create the replay controller.
 *
 * @param {object} options
 * @param {object} options.posthog   posthog-js singleton (or a stub in tests)
 * @param {Record<string, string | undefined>} [options.env]
 * @param {{ read: () => string, subscribe?: (fn: (state: string) => void) => (() => void) }} options.consent
 * @param {{ onRouteChange?: (fn: (url: string) => void) => (() => void) }} [options.router]
 * @param {{ pathname?: string, origin?: string }} [options.location]
 */
export function createReplayController({ posthog, env = {}, consent, router, location } = {}) {
  const config = resolveConfig(env)
  const unsubscribers = []
  const state = {
    mounted: false,
    initialized: false,
    client: null,
    recording: false,
    consent: 'unknown',
  }

  function currentPath() {
    const fromLocation = typeof location?.pathname === 'string' ? location.pathname : null
    if (!fromLocation) return '/'
    const parsed = toPathname(fromLocation, { origin: location?.origin })
    return parsed ?? fromLocation
  }

  function ensureClient() {
    if (state.client) return state.client
    if (!config || !posthog) return null
    try {
      // Reuse an existing browser singleton as-is: never init a second client.
      if (posthog.__loaded) {
        state.client = posthog
        return state.client
      }
      posthog.init(
        config.token,
        buildInitOptions({ host: config.host, origin: location?.origin }),
      )
      state.initialized = true
      state.client = posthog
    } catch {
      state.client = null
    }
    return state.client
  }

  function stop() {
    const client = state.client
    state.recording = false
    if (!client) return false
    try {
      client.stopSessionRecording()
    } catch {
      /* replay must never break the page */
    }
    return true
  }

  function optOut() {
    const client = state.client
    if (!client) return
    try {
      client.opt_out_capturing()
    } catch {
      /* replay must never break the page */
    }
  }

  function start() {
    if (!state.mounted || !config) return false
    if (isSensitivePath(currentPath())) {
      stop()
      return false
    }
    const client = ensureClient()
    if (!client) return false
    if (state.recording) return true
    try {
      // Affirmative consent: plain calls, no `true` and no override object, so
      // project enablement, sampling, triggers and authorised domains still apply.
      client.opt_in_capturing()
      client.startSessionRecording()
      state.recording = true
    } catch {
      state.recording = false
    }
    return state.recording
  }

  function applyConsent(next) {
    state.consent = normalizeConsent(next)
    if (!state.mounted || !config) return state.consent
    if (state.consent === 'granted') {
      start()
      return state.consent
    }
    stop()
    if (state.consent === 'denied') optOut()
    return state.consent
  }

  function handleRouteChange(url) {
    if (!state.mounted || !config) return
    const pathname = toPathname(url, { origin: location?.origin }) ?? currentPath()
    if (isSensitivePath(pathname)) {
      stop()
      return
    }
    if (state.consent === 'granted') start()
  }

  function mount() {
    if (state.mounted) return api
    state.mounted = true
    // Missing token or host: a complete no-op, including listeners.
    if (!config) return api

    try {
      const offConsent = consent?.subscribe?.((next) => applyConsent(next))
      if (typeof offConsent === 'function') unsubscribers.push(offConsent)
    } catch {
      /* consent wiring must never break the page */
    }
    try {
      const offRouter = router?.onRouteChange?.((url) => handleRouteChange(url))
      if (typeof offRouter === 'function') unsubscribers.push(offRouter)
    } catch {
      /* routing wiring must never break the page */
    }

    applyConsent(consent?.read?.())
    return api
  }

  function exit() {
    stop()
  }

  function dispose() {
    if (!state.mounted) return
    state.mounted = false
    stop()
    while (unsubscribers.length > 0) {
      const off = unsubscribers.pop()
      try {
        off()
      } catch {
        /* ignore listener teardown failures */
      }
    }
  }

  const api = {
    mount,
    dispose,
    exit,
    start,
    stop,
    handleRouteChange,
    applyConsent,
    getState() {
      return {
        configured: Boolean(config),
        mounted: state.mounted,
        initialized: state.initialized,
        recording: state.recording,
        consent: state.consent,
      }
    },
  }

  return api
}
