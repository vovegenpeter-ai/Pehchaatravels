'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/CartContext'

export default function BookTourButton({ tour }) {
  const { addItem } = useCart()
  const router = useRouter()
  const [adding, setAdding] = useState(false)

  const handleBook = () => {
    setAdding(true)
    addItem(tour)
    setTimeout(() => {
      setAdding(false)
      router.push('/cart')
    }, 400)
  }

  return (
    <button
      type="button"
      className="btn btn--primary btn--full"
      onClick={handleBook}
      disabled={adding}
    >
      {adding ? 'Adding to Cart...' : 'Book This Tour'}
    </button>
  )
}
