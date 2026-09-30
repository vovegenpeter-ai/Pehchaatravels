'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/CartContext'
import { formatPrice, priceBreakdown } from '@/lib/tourUtils'

import { useAuth } from '@/lib/AuthContext'

const PAYMENT_METHODS = [
  { value: 'BANK_TRANSFER', label: 'Bank Transfer', desc: 'Pay via bank transfer — details shared after booking' },
  { value: 'JAZZCASH', label: 'JazzCash', desc: 'Pay through your JazzCash mobile wallet' },
  { value: 'EASYPAISA', label: 'EasyPaisa', desc: 'Pay through your EasyPaisa mobile wallet' },
  { value: 'CASH', label: 'Cash on Arrival', desc: 'Pay in cash when the tour starts' },
]

/** Maps a cart item to its selected package, persons count and price. */
function itemPackage(item) {
  return item.bookingType === 'COUPLE'
    ? { label: 'Couple (2 Persons)', persons: 2, price: Number(item.couplePrice ?? item.price) }
    : { label: 'Single Person', persons: 1, price: Number(item.singlePrice ?? item.price) }
}

export default function CheckoutPage() {
  const { items, mounted, clearCart, totalPrice } = useCart()
  const { user } = useAuth()
  const [step, setStep] = useState('summary') // summary → payment → done
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER')
  const [confirmedOrder, setConfirmedOrder] = useState(null)
  /* Snapshot of the summary at confirmation time — the cart is cleared after
     the order is created, so derived totals must be captured before that. */
  const [confirmedSummary, setConfirmedSummary] = useState(null)
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
  })

  // Pre-fill form with logged-in user's details instantly
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullName: prev.fullName || user.fullName || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
      }))
    }
  }, [user])

  const subtotal = totalPrice
  const { taxes, total } = priceBreakdown(subtotal)
  const totalPersons = items.reduce((sum, item) => sum + itemPackage(item).persons * item.quantity, 0)

  if (!mounted) {
    return (
      <section className="checkout-section">
        <div className="container">
          <div className="loading">
            <div className="loading__spinner" />
            <p>Loading checkout...</p>
          </div>
        </div>
      </section>
    )
  }

  if (items.length === 0 && !confirmedOrder) {
    return (
      <section className="checkout-section">
        <div className="container">
          <div className="cart-empty">
            <div className="cart-empty__icon">📦</div>
            <h2>No Items to Checkout</h2>
            <p>Your cart is empty. Add some tours before proceeding to checkout.</p>
            <Link href="/tours" className="btn btn--primary btn--lg">
              Explore Tours
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.fullName || !form.email || !form.phone) {
      setError('Please fill in all required fields.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          paymentMethod,
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            image: item.image,
            price: item.price,
            quantity: item.quantity,
            bookingType: item.bookingType || 'SINGLE',
          })),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit booking')
      }

      setConfirmedSummary({
        items: items.map((item) => ({ ...item })),
        paymentMethod,
        subtotal,
        taxes,
        total: Number(data.order?.totalAmount) || total,
      })
      setConfirmedOrder(data.order)
      clearCart()
      setStep('done')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Step indicator ── */
  const steps = [
    { key: 'summary', label: '1. Booking Summary' },
    { key: 'payment', label: '2. Payment' },
    { key: 'done', label: '3. Confirmation' },
  ]
  const activeIndex = steps.findIndex((s) => s.key === (confirmedOrder ? 'done' : step))

  const renderSummary = () => (
    <div className="checkout-summary">
      <div className="cart-summary checkout-summary__card">
        <h3>Booking Summary</h3>
        {items.map((item) => {
          const pkg = itemPackage(item)
          return (
            <div key={item.id} className="checkout-summary__item">
              <div className="checkout-summary__item-img">
                <img src={item.image} alt={item.name} />
              </div>
              <div className="checkout-summary__item-info">
                <span className="checkout-summary__item-name">{item.name}</span>
                <span className="checkout-summary__item-meta">
                  {pkg.label} · {pkg.persons * item.quantity} {pkg.persons * item.quantity === 1 ? 'person' : 'persons'}
                </span>
                {item.quantity > 1 && (
                  <span className="checkout-summary__item-meta">
                    PKR {formatPrice(pkg.price)} × {item.quantity}
                  </span>
                )}
              </div>
              <span className="checkout-summary__item-price">
                PKR {formatPrice(pkg.price * item.quantity)}
              </span>
            </div>
          )
        })}
        <div className="cart-summary__divider" />
        <div className="cart-summary__row">
          <span>Subtotal ({totalPersons} {totalPersons === 1 ? 'person' : 'persons'})</span>
          <span>PKR {formatPrice(subtotal)}</span>
        </div>
        <div className="cart-summary__row">
          <span>Service Charges</span>
          <span>{taxes === 0 ? 'Free' : `PKR ${formatPrice(taxes)}`}</span>
        </div>
        <div className="cart-summary__divider" />
        <div className="cart-summary__row cart-summary__row--total">
          <span>Final Total</span>
          <span>PKR {formatPrice(total)}</span>
        </div>
      </div>
    </div>
  )

  /* ── Step 1: Booking Summary ── */
  if (step === 'summary') {
    return (
      <section className="checkout-section">
        <div className="container">
          <h1 className="cart-title">Booking Summary</h1>
          <div className="checkout-steps" role="list">
            {steps.map((s, i) => (
              <span
                key={s.key}
                role="listitem"
                className={`checkout-step${i <= activeIndex ? ' checkout-step--active' : ''}${i === activeIndex ? ' checkout-step--current' : ''}`}
              >
                {s.label}
              </span>
            ))}
          </div>

          <div className="checkout-layout">
            <div className="checkout-form">
              <div className="checkout-form__card">
                <h3>🧳 Your Selected Packages</h3>
                {items.map((item) => {
                  const pkg = itemPackage(item)
                  return (
                    <div key={item.id} className="checkout-package-row">
                      <div className="checkout-package-row__info">
                        <strong>{item.name}</strong>
                        <span className="checkout-package-row__meta">
                          Selected option: <em>{pkg.label}</em> · {pkg.persons * item.quantity} {pkg.persons * item.quantity === 1 ? 'person' : 'persons'}
                        </span>
                      </div>
                      <div className="checkout-package-row__price">
                        PKR {formatPrice(pkg.price * item.quantity)}
                      </div>
                    </div>
                  )
                })}
                <p className="checkout-form__note">
                  Your package selection is locked in — no need to choose it again. You can
                  still <Link href="/cart">edit your cart</Link> before payment.
                </p>
              </div>

              <div className="checkout-form__card">
                <h3>👤 Contact Information</h3>
                <div className="form-group">
                  <label htmlFor="fullName">Full Name *</label>
                  <input id="fullName" name="fullName" type="text" required value={form.fullName} onChange={handleChange} placeholder="Enter your full name" />
                </div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder="your@email.com" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone *</label>
                    <input id="phone" name="phone" type="tel" required value={form.phone} onChange={handleChange} placeholder="+92 xxx xxx xxxx" />
                  </div>
                </div>
              </div>

              <div className="checkout-form__card">
                <h3>📍 Address (Optional)</h3>
                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="address">Street Address</label>
                    <input id="address" name="address" type="text" value={form.address} onChange={handleChange} placeholder="House number, street, area" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input id="city" name="city" type="text" value={form.city} onChange={handleChange} placeholder="Your city" />
                  </div>
                </div>
              </div>

              <div className="checkout-form__card">
                <h3>📝 Additional Notes (Optional)</h3>
                <div className="form-group">
                  <label htmlFor="notes">Special requests or requirements</label>
                  <textarea id="notes" name="notes" rows={3} value={form.notes} onChange={handleChange} placeholder="Any special requirements, dietary needs, accessibility requirements..." style={{ resize: 'vertical' }} />
                </div>
              </div>

              <button
                type="button"
                className="btn btn--primary btn--full btn--lg"
                onClick={() => { setError(''); setStep('payment'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              >
                Continue to Payment — PKR {formatPrice(total)}
              </button>
            </div>

            {renderSummary()}
          </div>
        </div>
      </section>
    )
  }

  /* ── Step 2: Payment ── */
  if (step === 'payment') {
    return (
      <section className="checkout-section">
        <div className="container">
          <h1 className="cart-title">Payment</h1>
          <div className="checkout-steps" role="list">
            {steps.map((s, i) => (
              <span
                key={s.key}
                role="listitem"
                className={`checkout-step${i <= activeIndex ? ' checkout-step--active' : ''}${i === activeIndex ? ' checkout-step--current' : ''}`}
              >
                {s.label}
              </span>
            ))}
          </div>

          <div className="checkout-layout">
            <form onSubmit={handlePayment} className="checkout-form">
              <div className="checkout-form__card">
                <h3>💳 Select Payment Method</h3>
                <div className="payment-options">
                  {PAYMENT_METHODS.map((pm) => (
                    <label
                      key={pm.value}
                      className={`payment-option${paymentMethod === pm.value ? ' payment-option--active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={pm.value}
                        checked={paymentMethod === pm.value}
                        onChange={() => setPaymentMethod(pm.value)}
                      />
                      <span className="payment-option__radio" aria-hidden="true" />
                      <span className="payment-option__body">
                        <span className="payment-option__label">{pm.label}</span>
                        <span className="payment-option__desc">{pm.desc}</span>
                      </span>
                    </label>
                  ))}
                </div>
                <p className="checkout-form__note">
                  Our team will contact you with payment instructions for your chosen
                  method right after booking.
                </p>
              </div>

              {error && <div className="error-banner">{error}</div>}

              <div className="checkout-actions">
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() => setStep('summary')}
                  disabled={submitting}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="btn btn--primary btn--lg checkout-actions__main"
                  disabled={submitting}
                >
                  {submitting ? 'Processing…' : `Proceed to Payment — PKR ${formatPrice(total)}`}
                </button>
              </div>
            </form>

            {renderSummary()}
          </div>
        </div>
      </section>
    )
  }

  /* ── Step 3: Confirmation ── */
  const order = confirmedOrder
  const summary = confirmedSummary
  return (
    <section className="checkout-section">
      <div className="container">
        <div className="checkout-success">
          <h1>Booking Confirmed!</h1>
          <p>
            Thank you for booking with Pehchaan Travels. We&apos;ve received your
            booking and our team will contact you shortly to finalize payment.
          </p>

          {order && (
            <div className="checkout-success__details">
              <h3>📋 Booking Summary</h3>
              <table>
                <tbody>
                  <tr>
                    <td>Order ID</td>
                    <td className="checkout-success__mono">{order.id.slice(-8).toUpperCase()}</td>
                  </tr>
                  <tr>
                    <td>Name</td>
                    <td>{order.fullName}</td>
                  </tr>
                  <tr>
                    <td>Email</td>
                    <td>{order.email}</td>
                  </tr>
                  <tr>
                    <td>Phone</td>
                    <td>{order.phone}</td>
                  </tr>
                  <tr>
                    <td>Payment Method</td>
                    <td>{PAYMENT_METHODS.find((p) => p.value === summary?.paymentMethod)?.label || summary?.paymentMethod || '—'}</td>
                  </tr>
                  <tr>
                    <td>Package(s)</td>
                    <td>
                      {(summary?.items || order.items).map((item) => {
                        const pkg = itemPackage(item)
                        const name = item.name || item.tourName
                        return (
                          <div key={item.id}>
                            {name} — {pkg.label} ({pkg.persons * item.quantity} {pkg.persons * item.quantity === 1 ? 'person' : 'persons'})
                          </div>
                        )
                      })}
                    </td>
                  </tr>
                  <tr><td colSpan="2"><hr /></td></tr>
                  <tr>
                    <td>Subtotal</td>
                    <td>PKR {formatPrice(summary?.subtotal ?? 0)}</td>
                  </tr>
                  <tr>
                    <td>Service Charges</td>
                    <td>{(summary?.taxes ?? 0) === 0 ? 'Free' : `PKR ${formatPrice(summary.taxes)}`}</td>
                  </tr>
                  <tr>
                    <td className="checkout-success__total-label">Final Total</td>
                    <td className="checkout-success__total">PKR {formatPrice(Number(order.totalAmount))}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <div className="checkout-success__info">
            <p>📧 A confirmation email has been sent to your email address.</p>
            <p>📞 Our team will call you within 24 hours to finalize your trip and payment.</p>
            {order && (
              <p className="checkout-success__save-id">
                💡 Save your Order ID: <strong className="checkout-success__mono">{order.id.slice(-8).toUpperCase()}</strong>
              </p>
            )}
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
