import { buildMetadata } from '@/lib/seo'

/* buildMetadata feeds the title WITHOUT the brand suffix — the root layout's
   title template appends " — Pehchaan Travels" exactly once. */
export const metadata = buildMetadata({
  title: 'Privacy Policy',
  description: 'How Pehchaan Travels collects, uses, and protects your personal information.',
  path: '/privacy',
})

export default function PrivacyPage() {
  return (
    <>
      {/* Page Hero */}
      <section className="page-hero" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80)' }}>
        <div className="page-hero__overlay">
          <div className="container">
            <h1>Privacy Policy</h1>
            <p>Your privacy matters to us — this page explains what we collect and why.</p>
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="section" style={{ background: '#ffffff' }}>
        <div className="container container--narrow">
          <div className="terms-content">
            <p className="terms-content__last-updated">Last updated: August 2026</p>

            <h2>1. Information We Collect</h2>
            <p>
              When you use Pehchaan Travels, we collect information that you provide directly to us. 
              This includes your name, email address, phone number, and any details you share when 
              booking a tour, subscribing to our newsletter, or contacting us.
            </p>
            <ul>
              <li><strong>Account details:</strong> name, email address, and phone number when you create an account</li>
              <li><strong>Booking details:</strong> traveller information, travel dates, and preferences for a tour</li>
              <li><strong>Payment information:</strong> processed securely by our payment providers — we do not store card numbers</li>
              <li><strong>Communications:</strong> messages you send to us through our contact forms or email</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to operate and improve our services:</p>
            <ul>
              <li>To process and manage your bookings and send confirmations</li>
              <li>To respond to your enquiries and provide customer support</li>
              <li>To send newsletters or promotional offers, where you have opted in</li>
              <li>To improve our website, tours, and overall traveller experience</li>
              <li>To comply with legal obligations and prevent fraud</li>
            </ul>

            <h2>3. Newsletter and Marketing Emails</h2>
            <p>
              You may subscribe to our newsletter through the form on our website. We send updates about 
              new tours, offers, and travel inspiration. You can unsubscribe at any time by using the 
              link in the footer of any email we send, or by contacting us directly. We will never sell 
              your email address, and you will not be added to our mailing list without your consent.
            </p>

            <h2>4. Cookies and Tracking</h2>
            <p>
              Our website uses cookies and similar technologies to keep you signed in, remember the items 
              in your cart, and understand how visitors use our site. You can control or disable cookies 
              through your browser settings, though some features of the site may not function correctly 
              as a result.
            </p>

            <h2>5. How We Share Your Information</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We share it only 
              in the following limited circumstances:
            </p>
            <ul>
              <li><strong>Service providers:</strong> payment processors, hotel and tour operators, and email delivery services that help us fulfil your booking</li>
              <li><strong>Legal requirements:</strong> where disclosure is required by law or to protect the rights and safety of our travellers</li>
              <li><strong>Business transfers:</strong> in connection with a merger, acquisition, or sale of assets, subject to this policy</li>
            </ul>

            <h2>6. Data Security</h2>
            <p>
              We take reasonable technical and organisational measures to protect your personal information 
              against unauthorised access, alteration, disclosure, or destruction. Payment transactions are 
              encrypted in transit and handled by compliant third-party processors. While no method of 
              transmission over the Internet is completely secure, we work to protect your data to the 
              best of our ability.
            </p>

            <h2>7. Data Retention</h2>
            <p>
              We retain your personal information only for as long as is necessary to provide you with our 
              services, comply with our legal obligations, resolve disputes, and enforce our agreements. 
              Booking records are kept for the period required by Pakistani tax and travel regulations. 
              You may request deletion of your account data at any time.
            </p>

            <h2>8. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access the personal information we hold about you</li>
              <li>Request correction of information that is inaccurate or incomplete</li>
              <li>Request deletion of your personal information, subject to legal obligations</li>
              <li>Opt out of marketing communications at any time</li>
              <li>Withdraw consent where we rely on consent to process your data</li>
            </ul>

            <h2>9. Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites, including hotel listings, booking 
              partners, and social media platforms. This Privacy Policy does not apply to those sites, 
              and we encourage you to review the privacy policy of any site you visit. We are not 
              responsible for the content or practices of third-party websites.
            </p>

            <h2>10. Children&apos;s Privacy</h2>
            <p>
              Our services are not directed to individuals under the age of 18, and we do not knowingly 
              collect personal information from children. If you believe a child has provided us with 
              personal information, please contact us and we will take steps to remove it.
            </p>

            <h2>11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices or 
              for legal, operational, or regulatory reasons. When we do, we will revise the &quot;Last updated&quot; 
              date at the top of this page. We encourage you to review this page periodically.
            </p>

            <h2>12. Contact Information</h2>
            <p>
              If you have any questions about this Privacy Policy or how we handle your data, please contact us:
            </p>
            <ul>
              <li>Email: <a href="mailto:pehchaantravels@gmail.com">pehchaantravels@gmail.com</a></li>
              <li>Phone: <a href="tel:+923264828913">+92 3264828913</a></li>
              <li>Address: Lahore, Pakistan</li>
            </ul>

          </div>
        </div>
      </section>
    </>
  )
}
