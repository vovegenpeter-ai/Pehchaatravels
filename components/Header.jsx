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

function CartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block' }}
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  )
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

  useEffect(() => {
    const handler = () => fetchUser()
    window.addEventListener('user-profile-updated', handler)
    return () => window.removeEventListener('user-profile-updated', handler)
  }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      const desktop = profileDesktopRef.current
      const mobile = profileMobileRef.current
      const clickedInside =
        (desktop && desktop.contains(e.target)) ||
        (mobile && mobile.contains(e.target))
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

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="header">
      <div className="header__inner">
        {/* Left: Logo */}
        <Link href="/" className="header__logo" onClick={closeMenu}>
          <img src="/logo.png" alt="Pehchaan Travels" className="logo__img" />
        </Link>

        {/* Center: Nav links */}
        <nav className={`header__nav ${menuOpen ? 'header__nav--open' : ''}`}>
          <ul className="header__links">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={closeMenu}
                  className={isActive(href) ? 'active' : ''}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile profile section — only visible inside slide-out nav on mobile */}
          {user && (
            <div className="header__mobile-profile">
              <button
                type="button"
                className="header__mobile-profile-trigger"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-expanded={profileOpen}
              >
                <Avatar
                  src={user.avatar}
                  name={user.fullName}
                  className="header__mobile-profile-avatar"
                />
                <div className="header__mobile-profile-info">
                  <span className="header__mobile-profile-name">{user.fullName}</span>
                  <span className="header__mobile-profile-email">{user.email}</span>
                </div>
                <span className={`header__mobile-profile-chevron ${profileOpen ? 'header__mobile-profile-chevron--open' : ''}`}>
                  ▾
                </span>
              </button>

              {profileOpen && (
                <div className="header__mobile-profile-dropdown">
                  <Link
                    href="/bookings"
                    className="header__mobile-profile-dropdown-item"
                    onClick={closeMenu}
                  >
                    My Bookings
                  </Link>
                  <Link
                    href="/profile"
                    className="header__mobile-profile-dropdown-item"
                    onClick={closeMenu}
                  >
                    My Profile
                  </Link>
                  <button
                    type="button"
                    className="header__mobile-profile-dropdown-item header__mobile-profile-dropdown-item--danger"
                    onClick={handleLogout}
                    disabled={loggingOut}
                  >
                    {loggingOut ? 'Signing out...' : 'Sign Out'}
                  </button>
                </div>
              )}
            </div>
          )}

          {!user && (
            <div className="header__mobile-profile">
              <Link
                href="/sign-in"
                className="header__mobile-profile-signin"
                onClick={closeMenu}
              >
                Sign In
              </Link>
            </div>
          )}
        </nav>

        {/* Right: Cart + Profile/Sign In + Hamburger */}
        <div className="header__right">
          {/* Cart icon — always visible */}
          <Link
            href="/cart"
            className="header__cart"
            aria-label="View cart"
            onClick={closeMenu}
          >
            <CartIcon />
            {cartMounted && totalItems > 0 && (
              <span className="header__cart-badge">{totalItems}</span>
            )}
          </Link>

          {/* Profile dropdown — only when logged in */}
          {user && (
            <div
              className="header-profile header-profile--desktop"
              ref={profileDesktopRef}
            >
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
                <span
                  className={`header-profile__chevron ${
                    profileOpen ? 'header-profile__chevron--open' : ''
                  }`}
                >
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
                    href="/bookings"
                    className="header-profile__dropdown-item"
                    onClick={() => {
                      setProfileOpen(false)
                      closeMenu()
                    }}
                  >
                    My Bookings
                  </Link>
                  <Link
                    href="/profile"
                    className="header-profile__dropdown-item"
                    onClick={() => {
                      setProfileOpen(false)
                      closeMenu()
                    }}
                  >
                    My Profile
                  </Link>
                  <button
                    type="button"
                    className="header-profile__dropdown-item header-profile__dropdown-item--danger"
                    onClick={handleLogout}
                    disabled={loggingOut}
                  >
                    {loggingOut ? 'Signing out...' : 'Sign Out'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Sign In — only when logged out */}
          {!user && (
            <Link
              href="/sign-in"
              className="header__signin"
              onClick={closeMenu}
            >
              Sign In
            </Link>
          )}

          {/* Mobile hamburger */}
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
