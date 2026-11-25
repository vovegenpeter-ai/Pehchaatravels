/**
 * Browser bootstrap — Next.js >= 15.3 runs this once in the browser, before
 * hydration, so it is the single place where PostHog is created.
 *
 * The actual replay logic lives in lib/posthog-replay.mjs (a plain ESM module
 * that the offline checks in posthog-replay.check.mjs import directly). This
 * file only injects the real SDK, the consent store and the App Router.
 *
 * Nothing is initialised until a visitor explicitly grants analytics consent,
 * and NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN / NEXT_PUBLIC_POSTHOG_HOST must both be
 * set — otherwise the controller is a no-op.
 */
import posthog from 'posthog-js'

import { createReplayController } from './lib/posthog-replay.mjs'
import { consentSource } from './lib/consent.js'

type RouteListener = (url: string) => void

const routeListeners = new Set<RouteListener>()

const router = {
  onRouteChange(listener: RouteListener) {
    routeListeners.add(listener)
    return () => {
      routeListeners.delete(listener)
    }
  },
}

const controller = createReplayController({
  posthog,
  env: {
    NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  },
  consent: consentSource,
  router,
  location: typeof window !== 'undefined' ? window.location : undefined,
})

/** Next calls this on every client-side navigation (push / replace / traverse). */
export function onRouterTransitionStart(url: string) {
  for (const listener of routeListeners) {
    try {
      listener(url)
    } catch {
      /* replay must never break navigation */
    }
  }
}

if (typeof window !== 'undefined') {
  try {
    controller.mount()
    // Leaving the page ends the recording; the stored consent choice is kept.
    window.addEventListener('pagehide', () => controller.exit())
  } catch {
    /* replay must never break the page */
  }
}
