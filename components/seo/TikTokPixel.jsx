'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { CONSENT_GRANTED, readConsent, subscribeConsent } from '@/lib/consent'
import {
  TIKTOK_PIXEL_ID,
  disableTikTokCookies,
  ensureTikTokPixel,
  trackTikTokPage,
} from '@/lib/tiktok'

/**
 * TikTok Pixel mount point.
 *
 * Renders nothing and loads nothing until the visitor grants analytics
 * consent. The App Router does not reload the document, so page views are sent
 * from here: one for the first eligible page and one per route change. The
 * pixel's own history observer is disabled in lib/tiktok.js, so each navigation
 * is counted exactly once.
 *
 * The admin dashboard is excluded — staff activity is not ad traffic.
 * Conversions come from lib/analytics.js `trackEvent`.
 */
export default function TikTokPixel() {
  const pathname = usePathname()
  const lastTrackedPath = useRef(null)

  useEffect(() => {
    if (!TIKTOK_PIXEL_ID) return undefined
    if (pathname && pathname.startsWith('/admin')) return undefined

    const sync = (consent) => {
      if (consent !== CONSENT_GRANTED) {
        if (lastTrackedPath.current !== null) {
          disableTikTokCookies()
          lastTrackedPath.current = null
        }
        return
      }
      if (!ensureTikTokPixel()) return
      if (lastTrackedPath.current === pathname) return
      lastTrackedPath.current = pathname
      trackTikTokPage()
    }

    sync(readConsent())
    return subscribeConsent(sync)
  }, [pathname])

  return null
}
