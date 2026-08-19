import Link from 'next/link'

export const metadata = {
  title: 'Booking Confirmed — Pehchaan Travels',
}

export default function CheckoutSuccessPage() {
  return (
    <section className="checkout-section">
      <div className="container">
        <div className="checkout-success">
          <div className="checkout-success__icon">✅</div>
          <h1>Booking Confirmed!</h1>
          <p>
            Thank you for booking with Pehchaan Travels. We&apos;ve received your
            booking and our team will contact you shortly to confirm the details.
          </p>
          <div className="checkout-success__info">
            <p>📧 A confirmation will be sent to your email address.</p>
            <p>📞 Our team will call you within 24 hours to finalize your trip.</p>
          </div>
          <div className="checkout-success__actions">
            <Link href="/tours" className="btn btn--primary btn--lg">
              Explore More Tours
            </Link>
            <Link href="/" className="btn btn--outline btn--lg">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
