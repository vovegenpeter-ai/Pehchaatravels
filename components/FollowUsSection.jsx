'use client'

import Link from 'next/link'
import { FaFacebook, FaInstagram, FaYoutube, FaTiktok } from 'react-icons/fa'

const PLATFORMS = [
  {
    key: 'facebook',
    label: 'Facebook',
    Icon: FaFacebook,
    color: '#1877F2',
  },
  {
    key: 'instagram',
    label: 'Instagram',
    Icon: FaInstagram,
    color: '#E4405F',
  },
  {
    key: 'youtube',
    label: 'YouTube',
    Icon: FaYoutube,
    color: '#FF0000',
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    Icon: FaTiktok,
    color: '#000000',
  },
]

export default function FollowUsSection({ socialMedia }) {
  const links = PLATFORMS.filter((p) => {
    const url = socialMedia?.[p.key + 'Url']
    return typeof url === 'string' && url.trim().length > 0
  })

  if (links.length === 0) return null

  return (
    <section className="follow-us-section" id="follow-us">
      <div className="container">
        <div className="follow-us-header">
          <h2 className="follow-us-title">Follow Us</h2>
          <p className="follow-us-subtitle">
            <strong className="follow-us-subtitle__line1">Follow the Journey, Discover More 🇵🇰</strong>
            <span className="follow-us-subtitle__line2">Stay connected with Pehchaan Travels for inspiring destinations, travel stories, and unforgettable adventures across Pakistan.</span>
          </p>
        </div>
        <div className="follow-us-links">
          {links.map(({ key, label, Icon, color }) => {
            const href = socialMedia[key + 'Url'].trim()
            return (
              <Link
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="follow-us-link"
                style={{ '--icon-color': color }}
                aria-label={`Follow us on ${label}`}
              >
                <span className="follow-us-icon" aria-hidden="true">
                  <Icon />
                </span>
                <span className="follow-us-label">{label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
