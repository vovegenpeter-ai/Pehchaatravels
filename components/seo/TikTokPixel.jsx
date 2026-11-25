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
 * Renders nothing and loads nothing until NEXT_PUBLIC_TIKTOK_PIXEL_ID is set and
 * the visitor grants analytics consent. The App Router does not reload the page
 * on navigation, so the initial PageView and every later route change are sent
 * from here. Conversions come from lib/analytics.js `trackEvent`.
 */
export default function TikTokPixel() {
  const pathname = usePathname()
  const lastTrackedPath = useRef(null)

  useEffect(() => {
    if (!TIKTOK_PIXEL_ID) return undefined

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
