'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import NavigationLoader from '@/components/NavigationLoader'

export default function LayoutShell({ children }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  if (isAdmin) {
    return <><NavigationLoader />{children}</>
  }

  return (
    <>
      <NavigationLoader />
      <div className="layout">
        <Header />
        <main>{children}</main>
        <Footer />
      </div>
    </>
  )
}
