'use client'

import { useEffect, useRef } from 'react'
import { trackViewContent } from '@/lib/analytics'

/**
 * Fires one TikTok `ViewContent` event when a detail page is opened.
 *
 * Rendered inside server components (tour, hotel and destination pages) so the
 * event uses the real database record — name, price and category — rather than
 * anything guessed from the URL. The ref guard keeps React re-renders and
 * StrictMode double-effects from sending it twice.
 */
export default function ViewContentTracker({
  id,
  name,
  type = 'destination',
  category,
  city,
  region,
  value,
  description,
}) {
  const fired = useRef(null)

  useEffect(() => {
    if (!id) return
    const key = `${type}:${id}`
    if (fired.current === key) return
    fired.current = key
    trackViewContent({ id, name, type, category, city, region, value, description })
  }, [id, name, type, category, city, region, value, description])

  return null
}
