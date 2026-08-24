'use client'

import { usePathname } from 'next/navigation'
import WhatsAppButton from './WhatsAppButton'

export default function ConditionalWhatsApp() {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  if (isAdmin) return null

  return <WhatsAppButton />
}
