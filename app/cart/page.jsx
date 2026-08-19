'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/CartContext'
import { formatPrice } from '@/lib/tourUtils'

export default function CartPage() {
  const { items, mounted, removeItem, updateQuantity, totalPrice, totalItems } = useCart()
  const [removing, setRemoving] = useState(null)
  const router = useRouter()

  if (!mounted) {
    return (
      <section className="cart-section">
        <div className="container">
          <div className="loading">
            <div className="loading__spinner" />
            <p>Loading cart...</p>
          </div>
        </div>
      </section>
    )
  }

  const handleRemove = (id) => {
    setRemoving(id)
    setTimeout(() => {
      removeItem(id)
      setRemoving(null)
    }, 300)
  }

  if (items.length === 0) {
    return (
      <section className="cart-section">
        <div className="container">
          <div className="cart-empty">
            <div className="cart-empty__icon">🛒</div>
            <h2>Your Cart is Empty</h2>
            <p>Looks like you haven&apos;t added any tours yet. Explore our amazing tour packages and start your adventure!</p>
            <Link href="/tours" className="btn btn--primary btn--lg">
              Explore Tours
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="cart-section">
      <div className="container">
        <h1 className="cart-title">Your Cart</h1>
        <p className="cart-subtitle">{totalItems} {totalItems === 1 ? 'tour' : 'tours'} in your cart</p>

        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => (
              <div
                key={item.id}
                className={`cart-item ${removing === item.id ? 'cart-item--removing' : ''}`}
              >
                <div className="cart-item__image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="cart-item__details">
                  <div className="cart-item__header">
                    <div>
                      <h3 className="cart-item__name">{item.name}</h3>
                      <p className="cart-item__destination">📍 {item.destination}</p>
                      <p className="cart-item__duration">⏱ {item.duration || `${item.days} Days`}</p>
                    </div>
                    <button
                      type="button"
                      className="cart-item__remove"
                      onClick={() => handleRemove(item.id)}
                      aria-label="Remove item"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="cart-item__footer">
                    <div className="cart-item__quantity">
                      <button
                        type="button"
                        className="cart-item__qty-btn"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>
                      <span className="cart-item__qty-value">{item.quantity}</span>
                      <button
                        type="button"
                        className="cart-item__qty-btn"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <div className="cart-item__price">
                      <span className="cart-item__unit-price">PKR {formatPrice(item.price)} × {item.quantity}</span>
                      <span className="cart-item__total-price">PKR {formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="cart-summary__rows">
              {items.map((item) => (
                <div key={item.id} className="cart-summary__row">
                  <span>{item.name} × {item.quantity}</span>
                  <span>PKR {formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="cart-summary__divider" />
            <div className="cart-summary__row cart-summary__row--total">
              <span>Total</span>
              <span>PKR {formatPrice(totalPrice)}</span>
            </div>
            <button
              type="button"
              className="btn btn--primary btn--full cart-summary__checkout"
              onClick={() => router.push('/checkout')}
            >
              Proceed to Checkout →
            </button>
            <Link href="/tours" className="btn btn--outline btn--full cart-summary__continue">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
