'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PHONE_NUMBER } from '@/lib/initialData'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/tours', label: 'Tours' },
  { href: '/places', label: 'Places' },
  { href: '/hotels', label: 'Hotels' },
  { href: '/make-my-trip', label: 'Make My Trip' },
  { href: '/contact', label: 'Contact Us' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  const isActive = (href) => {
    if (!mounted) return false
    return href === '/' ? pathname === '/' : pathname.startsWith(href)
  }

  return (
    <header className="header">
      <div className="container header__inner">
        <Link href="/" className="logo" onClick={() => setMenuOpen(false)}>
          <span className="logo__icon">✈</span>
          <span className="logo__text">
            Pehchaan <strong>Travels</strong>
          </span>
        </Link>

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
            <a href={`tel:${PHONE_NUMBER.replace(/\s/g, '')}`} className="btn btn--phone">
              📞 {PHONE_NUMBER}
            </a>
            <Link href="/sign-in" className="btn btn--primary" onClick={() => setMenuOpen(false)}>
              Sign In
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
