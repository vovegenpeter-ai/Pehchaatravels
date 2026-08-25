'use client'

import { useState } from 'react'

/**
 * Displays a star rating with half-star support (0.5 increments)
 * 
 * Props:
 * - rating: number (0-5, supports 0.5 increments)
 * - size: string (CSS font-size, default '16px')
 * - showValue: boolean (show numeric value next to stars)
 */

export function StarDisplay({ rating, size = '16px', showValue = false }) {
  const stars = []
  const fullStars = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.5

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(<span key={i} style={{ color: '#f59e0b' }}>★</span>)
    } else if (i === fullStars + 1 && hasHalf) {
      stars.push(
        <span key={i} style={{ position: 'relative', display: 'inline-block' }}>
          <span style={{ color: '#d1d5db' }}>★</span>
          <span style={{ 
            position: 'absolute', 
            left: 0, 
            top: 0, 
            width: '50%', 
            overflow: 'hidden', 
            color: '#f59e0b' 
          }}>★</span>
        </span>
      )
    } else {
      stars.push(<span key={i} style={{ color: '#d1d5db' }}>★</span>)
    }
  }

  return (
    <span style={{ fontSize: size, lineHeight: 1, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
      {stars}
      {showValue && (
        <span style={{ marginLeft: '6px', fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>
          {rating.toFixed(1)}
        </span>
      )}
    </span>
  )
}

export function StarInput({ value = 0, onChange, size = '2rem' }) {
  const [hoverValue, setHoverValue] = useState(0)

  const handleClick = (star, isHalf) => {
    const newValue = isHalf ? star - 0.5 : star
    onChange(newValue)
  }

  const handleMouseMove = (e, star) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const isHalf = x < rect.width / 2
    setHoverValue(isHalf ? star - 0.5 : star)
  }

  const displayValue = hoverValue || value

  return (
    <div 
      style={{ display: 'inline-flex', gap: '2px', cursor: 'pointer' }}
      onMouseLeave={() => setHoverValue(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isFull = displayValue >= star
        const isHalf = !isFull && displayValue >= star - 0.5

        return (
          <div
            key={star}
            style={{ position: 'relative', fontSize: size, lineHeight: 1, cursor: 'pointer' }}
            onMouseMove={(e) => handleMouseMove(e, star)}
          >
            {/* Background star (empty) */}
            <span style={{ color: '#d1d5db' }}>★</span>
            
            {/* Filled portion */}
            {(isFull || isHalf) && (
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: isFull ? '100%' : '50%',
                  overflow: 'hidden',
                  color: '#f59e0b',
                }}
              >
                ★
              </span>
            )}

            {/* Click areas */}
            <button
              type="button"
              onClick={() => handleClick(star, false)}
              style={{
                position: 'absolute',
                left: '50%',
                top: 0,
                width: '50%',
                height: '100%',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                zIndex: 2,
              }}
              tabIndex={-1}
            />
            <button
              type="button"
              onClick={() => handleClick(star, true)}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '50%',
                height: '100%',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                zIndex: 2,
              }}
              tabIndex={-1}
            />
          </div>
        )
      })}
    </div>
  )
}
