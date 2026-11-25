'use client'

import { usePathname } from 'next/navigation'
import ConsentBanner from './ConsentBanner'

/** Hides the analytics consent banner inside the admin dashboard. */
export default function ConditionalConsentBanner() {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  if (isAdmin) return null

  return <ConsentBanner />
}
