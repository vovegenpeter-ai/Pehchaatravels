'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { PHONE_NUMBER } from '@/lib/initialData'
import { useCart } from '@/lib/CartContext'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/tours', label: 'Tours' },
  { href: '/places', label: 'Places' },
  { href: '/hotels', label: 'Hotels' },
  { href: '/make-my-trip', label: 'Make My Trip' },
]

function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function Avatar({ src, name, className }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={className}
        style={{ objectFit: 'cover', borderRadius: '50%' }}
      />
    )
  }
  return <span className={className}>{getInitials(name)}</span>
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const profileDesktopRef = useRef(null)
  const profileMobileRef = useRef(null)
  const pathname = usePathname()
  const router = useRouter()
  const { totalItems, mounted: cartMounted } = useCart()

  const fetchUser = () => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setUser(data?.user || null))
      .catch(() => setUser(null))
  }

  useEffect(() => {
    setMounted(true)
    fetchUser()
  }, [pathname])

  // Re-fetch user when profile is updated from another component
  useEffect(() => {
    const handler = () => fetchUser()
    window.addEventListener('user-profile-updated', handler)
    return () => window.removeEventListener('user-profile-updated', handler)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      const desktop = profileDesktopRef.current
      const mobile = profileMobileRef.current
      const clickedInside = (desktop && desktop.contains(e.target)) || (mobile && mobile.contains(e.target))
      if (!clickedInside) {
        setProfileOpen(false)
      }
    }
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [profileOpen])

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/auth/me', { method: 'DELETE' })
      setUser(null)
      setProfileOpen(false)
      router.push('/')
      router.refresh()
    } catch {
      setLoggingOut(false)
    }
  }

  const isActive = (href) => {
    if (!mounted) return false
    return href === '/' ? pathname === '/' : pathname.startsWith(href)
  }

  const isHome = mounted && pathname === '/'

  return (
    <header className="header">
      <div className="container header__inner">
        <Link href="/" className="logo" onClick={() => setMenuOpen(false)}>
          <img src="/logo.png" alt="Pehchaan Travels" className="logo__img" />
        </Link>

        <nav className={`header__nav ${menuOpen ? 'header__nav--open' : ''}`}>
          <ul className="header__links">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={isActive(href) ? 'active' : ''}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="header__actions">
            {!user && (
              <Link href="/sign-in" className="btn btn--primary" onClick={() => setMenuOpen(false)}>
                Sign In
              </Link>
            )}
            {user && (
              <div className="header-profile header-profile--desktop" ref={profileDesktopRef}>
                <button
                  type="button"
                  className="header-profile__trigger"
                  onClick={() => setProfileOpen(!profileOpen)}
                  aria-expanded={profileOpen}
                  aria-label="User menu"
                >
                  <Avatar
                    src={user.avatar}
                    name={user.fullName}
                    className="header-profile__avatar"
                  />
                  <span className="header-profile__name">{user.fullName}</span>
                  <span className={`header-profile__chevron ${profileOpen ? 'header-profile__chevron--open' : ''}`}>
                    ▾
                  </span>
                </button>

                {profileOpen && (
                  <div className="header-profile__dropdown">
                    <div className="header-profile__dropdown-header">
                      <Avatar
                        src={user.avatar}
                        name={user.fullName}
                        className="header-profile__avatar header-profile__avatar--lg"
                      />
                      <div>
                        <strong>{user.fullName}</strong>
                        <span>{user.email}</span>
                      </div>
                    </div>
                    <div className="header-profile__dropdown-divider" />
                    <Link
                      href="/cart"
                      className="header-profile__dropdown-item"
                      onClick={() => { setProfileOpen(false); setMenuOpen(false) }}
                    >
                      🛒 My Bookings
                    </Link>
                    <Link
                      href="/profile"
                      className="header-profile__dropdown-item"
                      onClick={() => { setProfileOpen(false); setMenuOpen(false) }}
                    >
                      👤 My Profile
                    </Link>
                    <button
                      type="button"
                      className="header-profile__dropdown-item header-profile__dropdown-item--danger"
                      onClick={handleLogout}
                      disabled={loggingOut}
                    >
                      {loggingOut ? 'Signing out...' : '🚪 Sign Out'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>

        <div className="header__right">
          <button
            type="button"
            className="header__toggle"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  )
}
