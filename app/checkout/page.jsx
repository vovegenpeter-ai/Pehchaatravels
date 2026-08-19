'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/CartContext'
import { formatPrice } from '@/lib/tourUtils'

export default function CheckoutPage() {
  const { items, mounted, totalPrice, totalItems, clearCart } = useCart()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
  })

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

  if (items.length === 0) {
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

  const handleSubmit = async (e) => {
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
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            image: item.image,
            price: item.price,
            quantity: item.quantity,
          })),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit booking')
      }

      clearCart()
      router.push('/checkout/success')
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="checkout-section">
      <div className="container">
        <h1 className="cart-title">Checkout</h1>
        <p className="cart-subtitle">Complete your booking details below</p>

        {error && <div className="error-banner">{error}</div>}

        <div className="checkout-layout">
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="checkout-form__card">
              <h3>👤 Contact Information</h3>
              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone *</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+92 xxx xxx xxxx"
                  />
                </div>
              </div>
            </div>

            <div className="checkout-form__card">
              <h3>📍 Address (Optional)</h3>
              <div className="form-group">
                <label htmlFor="address">Street Address</label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="House number, street, area"
                />
              </div>
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Your city"
                />
              </div>
            </div>

            <div className="checkout-form__card">
              <h3>📝 Additional Notes (Optional)</h3>
              <div className="form-group">
                <label htmlFor="notes">Special requests or requirements</label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Any special requirements, dietary needs, accessibility requirements..."
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--full btn--lg"
              disabled={submitting}
            >
              {submitting ? 'Submitting Booking...' : `Confirm Booking — PKR ${formatPrice(totalPrice)}`}
            </button>
          </form>

          <div className="checkout-summary">
            <div className="cart-summary checkout-summary__card">
              <h3>Booking Summary</h3>
              <div className="cart-summary__rows">
                {items.map((item) => (
                  <div key={item.id} className="checkout-summary__item">
                    <div className="checkout-summary__item-img">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="checkout-summary__item-info">
                      <span className="checkout-summary__item-name">{item.name}</span>
                      <span className="checkout-summary__item-meta">
                        {item.duration || `${item.days} Days`} · Qty: {item.quantity}
                      </span>
                    </div>
                    <span className="checkout-summary__item-price">
                      PKR {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="cart-summary__divider" />
              <div className="cart-summary__row cart-summary__row--total">
                <span>Total</span>
                <span>PKR {formatPrice(totalPrice)}</span>
              </div>
              <Link href="/cart" className="btn btn--outline btn--full" style={{ marginTop: '1rem' }}>
                ← Edit Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
