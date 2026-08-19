'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const CartContext = createContext(null)

const CART_KEY = 'pehchaan_cart'

function loadCart() {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(CART_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveCart(items) {
  if (typeof window === 'undefined') return
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [mounted, setMounted] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    setItems(loadCart())
    setMounted(true)
  }, [])

  // Persist cart to localStorage on change
  useEffect(() => {
    if (mounted) saveCart(items)
  }, [items, mounted])

  const addItem = useCallback((tour) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === tour.id)
      if (existing) {
        return prev.map((item) =>
          item.id === tour.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [
        ...prev,
        {
          id: tour.id,
          slug: tour.slug,
          name: tour.name,
          destination: tour.destination,
          price: Number(tour.price),
          image: tour.image,
          days: tour.days,
          duration: tour.duration,
          quantity: 1,
        },
      ]
    })
  }, [])

  const removeItem = useCallback((tourId) => {
    setItems((prev) => prev.filter((item) => item.id !== tourId))
  }, [])

  const updateQuantity = useCallback((tourId, quantity) => {
    if (quantity < 1) return
    setItems((prev) =>
      prev.map((item) =>
        item.id === tourId ? { ...item, quantity } : item
      )
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        mounted,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
