'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { CONSENT_GRANTED, readConsent, subscribeConsent } from '@/lib/consent'
import {
  META_PIXEL_ID,
  disableMetaCookies,
  ensureMetaPixel,
  trackMetaPage,
} from '@/lib/metaPixel'

/**
 * Meta (Facebook & Instagram) Pixel mount point.
 *
 * Renders nothing and loads nothing until the visitor grants analytics
 * consent, and until NEXT_PUBLIC_META_PIXEL_ID is set. The App Router does not
 * reload the document, so page views are sent from here: one for the first
 * eligible page and one per route change.
 *
 * The pixel's own history/PageView behaviour is not used — this component is
 * the single PageView source, so each navigation is counted exactly once.
 *
 * The admin dashboard is excluded — staff activity is not ad traffic.
 * Conversions come from lib/analytics.js `trackEvent`.
 */
export default function MetaPixel() {
  const pathname = usePathname()
  const lastTrackedPath = useRef(null)

  useEffect(() => {
    if (!META_PIXEL_ID) return undefined
    if (pathname && pathname.startsWith('/admin')) return undefined

    const sync = (consent) => {
      if (consent !== CONSENT_GRANTED) {
        if (lastTrackedPath.current !== null) {
          disableMetaCookies()
          lastTrackedPath.current = null
        }
        return
      }
      if (!ensureMetaPixel()) return
      if (lastTrackedPath.current === pathname) return
      lastTrackedPath.current = pathname
      trackMetaPage()
    }

    sync(readConsent())
    return subscribeConsent(sync)
  }, [pathname])

  return null
}
