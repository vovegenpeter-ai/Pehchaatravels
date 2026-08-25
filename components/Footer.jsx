import Link from 'next/link'
import { useState } from 'react'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

  return (
    <footer className="footer">
      <div className="container footer__grid">
        {/* Brand Column */}
        <div className="footer__col footer__col--brand">
          <Link href="/" className="footer__logo">
            <img src="/logo.png" alt="Pehchaan Travels" className="footer__logo-img" />
          </Link>
          <p className="footer__desc">
            Your trusted partner for exploring the unseen beauty of Pakistan.
          </p>
        </div>

        {/* Explore Column */}
        <div className="footer__col">
          <h4>Explore</h4>
          <ul>
            <li><Link href="/tours">Tours</Link></li>
            <li><Link href="/places">Places</Link></li>
            <li><Link href="/hotels">Hotels</Link></li>
          </ul>
        </div>

        {/* Company Column */}
        <div className="footer__col">
          <h4>Company</h4>
          <ul>
            <li><Link href="/about">Company Bio</Link></li>
            <li><Link href="/contact">Contact Us</Link></li>
            <li><Link href="/terms">Terms of Service</Link></li>
          </ul>
        </div>

        {/* Newsletter Column */}
        <div className="footer__col footer__col--newsletter">
          <h4>Newsletter</h4>
          <p className="footer__newsletter-desc">
            Subscribe to get latest updates and offers.
          </p>
          <form className="footer__newsletter" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="footer__newsletter-input"
            />
            <button type="submit" className="footer__newsletter-btn" aria-label="Subscribe">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
          {subscribed && <p className="footer__newsletter-success">Thanks for subscribing!</p>}
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container">
          <p>© {new Date().getFullYear()} Pehchaan Travels. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
