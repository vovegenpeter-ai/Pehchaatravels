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
                    </div>
                    <button
                      type="button"
                      className="cart-item__remove"
                      onClick={() => handleRemove(item.id)}
                      aria-label="Remove item"
                      title="Remove tour"
                    >
                      <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v5M14 11v5" />
                      </svg>
                    </button>
                  </div>
                  <div className="cart-item__footer">
                    <div className="cart-item__quantity">
                      <label htmlFor={`seats-${item.id}`}>Number of Seats</label>
                      <div className="cart-item__quantity-control">
                        <button
                          type="button"
                          className="cart-item__qty-btn"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease number of seats"
                        >
                          −
                        </button>
                        <input
                          id={`seats-${item.id}`}
                          type="number"
                          min="1"
                          step="1"
                          inputMode="numeric"
                          value={item.quantity}
                          onChange={(e) => {
                            const seats = Number(e.target.value)
                            if (Number.isInteger(seats) && seats >= 1) updateQuantity(item.id, seats)
                          }}
                          aria-label={`Number of Seats for ${item.name}`}
                        />
                        <button
                          type="button"
                          className="cart-item__qty-btn"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Increase number of seats"
                        >
                          +
                        </button>
                      </div>
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
