'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackEvent, EVENTS } from '@/lib/analytics'

const WHATSAPP_HOST = 'wa.me'

/**
 * Contact-intent tracking for the whole site.
 *
 * Phone (`tel:`) links and WhatsApp (`wa.me`) links are scattered through the
 * footer, FAQ page and contact page, so instead of editing each one this listens
 * for clicks once and reports them as TikTok `Contact` events.
 *
 * The floating WhatsApp button (`#whatsapp-fab`) reports itself with a known
 * location, so it is skipped here to avoid a duplicate Contact event.
 */
export default function ClickTracking() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname && pathname.startsWith('/admin')) return undefined

    const handleClick = (event) => {
      const target = event.target
      if (!target || typeof target.closest !== 'function') return
      const anchor = target.closest('a[href]')
      if (!anchor) return

      const href = anchor.getAttribute('href') || ''
      const location = pathname || 'unknown'

      if (href.startsWith('tel:')) {
        trackEvent(EVENTS.phoneClick, {
          location,
          phone: href.replace(/^tel:/, ''),
        })
        return
      }

      if (href.includes(WHATSAPP_HOST)) {
        /* The floating button reports itself with a known location. */
        if (
          anchor.id === 'whatsapp-fab' ||
          anchor.classList.contains('whatsapp-fab') ||
          anchor.closest('.whatsapp-fab')
        ) {
          return
        }
        trackEvent(EVENTS.whatsappClick, { location })
      }
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [pathname])

  return null
}
