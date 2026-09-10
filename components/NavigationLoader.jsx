'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

const NAVIGATION_EVENT = 'pehchaan:navigation-start'

export function startNavigation() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(NAVIGATION_EVENT))
  }
}

export default function NavigationLoader() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(false)
  }, [pathname])

  useEffect(() => {
    const handleNavigationStart = () => setLoading(true)
    const handleLinkClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const link = event.target.closest('a[href]')
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return
      const url = new URL(link.href, window.location.href)
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname && url.search === window.location.search) return
      setLoading(true)
    }

    window.addEventListener(NAVIGATION_EVENT, handleNavigationStart)
    document.addEventListener('click', handleLinkClick, true)
    return () => {
      window.removeEventListener(NAVIGATION_EVENT, handleNavigationStart)
      document.removeEventListener('click', handleLinkClick, true)
    }
  }, [])

  if (!loading) return null

  return (
    <div className="navigation-loader" role="status" aria-live="polite" aria-label="Loading page">
      <div className="navigation-loader__spinner" />
      <span>Loading...</span>
    </div>
  )
}
