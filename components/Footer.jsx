import Link from 'next/link'
import { PHONE_NUMBER, EMAIL, ADDRESS } from '@/lib/initialData'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__col">
          <Link href="/" className="logo footer__logo">
            <span className="logo__icon">✈</span>
            <span className="logo__text">
              Pehchaan <strong>Travels</strong>
            </span>
          </Link>
          <p className="footer__desc">
            Your trusted partner for exploring Pakistan&apos;s breathtaking Northern Areas
            and beyond. We create unforgettable travel experiences.
          </p>
        </div>

        <div className="footer__col">
          <h4>Quick Links</h4>
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/tours">Tours</Link></li>
            <li><Link href="/places">Places</Link></li>
            <li><Link href="/hotels">Hotels</Link></li>
            <li><Link href="/make-my-trip">Make My Trip</Link></li>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/contact">Contact Us</Link></li>
          </ul>
        </div>

        <div className="footer__col">
          <h4>Contact Information</h4>
          <ul className="footer__contact">
            <li><a href={`tel:${PHONE_NUMBER.replace(/\s/g, '')}`}>📞 {PHONE_NUMBER}</a></li>
            <li><a href={`mailto:${EMAIL}`}>✉ {EMAIL}</a></li>
            <li>📍 {ADDRESS}</li>
          </ul>
        </div>

        <div className="footer__col">
          <h4>Follow Us</h4>
          <div className="footer__social">
            <a href="#" aria-label="Facebook">Facebook</a>
            <a href="#" aria-label="Instagram">Instagram</a>
            <a href="#" aria-label="YouTube">YouTube</a>
            <a href="#" aria-label="WhatsApp">WhatsApp</a>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container">
          <p>© 2026 Pehchaan Travels. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  )
}
