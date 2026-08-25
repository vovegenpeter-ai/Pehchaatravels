'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/bookings', label: 'Bookings' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/contact-queries', label: 'Contact Queries' },
  { href: '/admin/trip-requests', label: 'Trip Requests' },
  { href: '/admin/destinations', label: 'Destinations' },
  { href: '/admin/home', label: 'Home Page' },
  { href: '/admin/hotels', label: 'Hotels' },
  { href: '/admin/newsletter', label: 'Newsletter' },
  { href: '/admin/reviews', label: 'Reviews' },
  { href: '/admin/tours', label: 'Tours' },
  { href: '/admin/users', label: 'Users' },
]

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    fetch('/api/admin/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setIsAuthenticated(Boolean(data?.authenticated)))
      .catch(() => setIsAuthenticated(false))
  }, [pathname])

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' })
      setIsAuthenticated(false)
      router.replace('/admin/login')
      router.refresh()
    } catch {
      setLoggingOut(false)
    }
  }

  return (
    <aside className="admin-nav">
      <div className="admin-nav__brand">
        <Link href="/admin" className="logo logo--admin">
          <img src="/logo.png" alt="Pehchaan Travels" className="logo__img" />
        </Link>
      </div>

      <nav>
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={pathname === href ? 'active' : ''}
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="admin-nav__footer">
        {isAuthenticated && (
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn--outline btn--sm admin-nav__logout"
            disabled={loggingOut}
          >
            {loggingOut ? 'Logging out...' : 'Logout'}
          </button>
        )}
      </div>
    </aside>
  )
}
