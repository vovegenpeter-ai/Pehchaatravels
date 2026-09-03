import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service — Pehchaan Travels',
  description: 'Terms and conditions for using Pehchaan Travels services and booking tours in Pakistan.',
}

export default function TermsPage() {
  return (
    <>
      {/* Page Hero */}
      <section className="page-hero" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80)' }}>
        <div className="page-hero__overlay">
          <div className="container">
            <h1>Terms of Service</h1>
            <p>Please read these terms carefully before using our services.</p>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="section" style={{ background: '#ffffff' }}>
        <div className="container container--narrow">
          <div className="terms-content">
            <p className="terms-content__last-updated">Last updated: August 2026</p>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using the Pehchaan Travels website and services, you agree to be bound by these Terms of Service. 
              If you do not agree to any part of these terms, you may not use our services.
            </p>

            <h2>2. Booking and Reservations</h2>
            <p>
              When you book a tour or service through Pehchaan Travels, you enter into a binding agreement. 
              All bookings are subject to availability and confirmation. We reserve the right to refuse or cancel any booking at our discretion.
            </p>
            <ul>
              <li>A deposit may be required to secure your booking</li>
              <li>Full payment must be completed before the tour commencement date</li>
              <li>Prices are subject to change without notice until a booking is confirmed</li>
              <li>All prices are quoted in Pakistani Rupees (PKR) unless otherwise stated</li>
            </ul>

            <h2>3. Cancellation Policy</h2>
            <p>
              We understand that plans can change. All cancellations must be requested in writing by email. Our cancellation terms are as follows:
            </p>
            <ul>
              <li><strong>30 days or more before departure:</strong> Full refund (minus a small administrative fee)</li>
              <li><strong>15–29 days before departure:</strong> 70% refund</li>
              <li><strong>8–14 days before departure:</strong> 40% refund</li>
              <li><strong>7 days or less before departure:</strong> No cash refund, but we will offer a credit valid for 12 months toward a future booking</li>
            </ul>
            <p>
              We always try to be as flexible as possible. If you need to reschedule instead of cancel, please contact us and we will do our best to help.
            </p>

            <h2>4. Travel Insurance</h2>
            <p>
              We strongly recommend that all travelers purchase comprehensive travel insurance before their trip. 
              Pehchaan Travels is not responsible for any losses, damages, or expenses incurred due to unforeseen circumstances, 
              including but not limited to medical emergencies, trip cancellations, or natural disasters.
            </p>

            <h2>5. Health and Safety</h2>
            <p>
              Travelers are responsible for ensuring they are physically fit for the tour they have booked. 
              Some tours may involve strenuous activities at high altitudes. Please inform us of any medical conditions 
              or dietary requirements at the time of booking.
            </p>

            <h2>6. Travel Documents</h2>
            <p>
              Travelers are responsible for ensuring they have valid identification documents, including:
            </p>
            <ul>
              <li>Valid passport (with at least 6 months validity)</li>
              <li>Required visas for international travelers</li>
              <li>Any other travel documents required by local authorities</li>
            </ul>

            <h2>7. Itinerary Changes</h2>
            <p>
              While we make every effort to adhere to published itineraries, we reserve the right to make changes due to:
            </p>
            <ul>
              <li>Weather conditions</li>
              <li>Road conditions</li>
              <li>Local events or festivals</li>
              <li>Safety concerns</li>
              <li>Other circumstances beyond our control</li>
            </ul>

            <h2>8. Liability Limitations</h2>
            <p>
              Pehchaan Travels acts as an intermediary between travelers and service providers (hotels, airlines, transport companies). 
              We are not liable for:
            </p>
            <ul>
              <li>Acts or omissions of third-party service providers</li>
              <li>Loss or theft of personal belongings</li>
              <li>Delays caused by weather, traffic, or other unforeseen circumstances</li>
              <li>Personal injury or illness during the tour</li>
            </ul>

            <h2>9. Photography and Marketing</h2>
            <p>
              Pehchaan Travels may take photographs or videos during tours for marketing purposes. 
              By booking with us, you consent to the use of your image in our marketing materials unless you inform us otherwise in writing.
            </p>

            <h2>10. Privacy Policy</h2>
            <p>
              Your personal information will be handled in accordance with our Privacy Policy. 
              We are committed to protecting your data and will not share it with third parties without your consent, 
              except as necessary to fulfill your booking.
            </p>

            <h2>11. Governing Law</h2>
            <p>
              These terms shall be governed by and construed in accordance with the laws of Pakistan. 
              Any disputes shall be subject to the exclusive jurisdiction of the courts of Pakistan.
            </p>

            <h2>12. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <ul>
              <li>Email: info@pehchaantravels.pk</li>
              <li>Phone: +92 300 1234567</li>
              <li>Address: Islamabad, Pakistan</li>
            </ul>

            <div className="terms-content__back">
              <Link href="/" className="btn btn--primary">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
