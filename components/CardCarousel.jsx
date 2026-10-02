'use client'

import { useState, Children } from 'react'

/* Number of cards visible at once — matches the site-wide 3-per-row card grid */
const PAGE_SIZE = 3

/* Chevron icon shared by both arrow buttons */
function Chevron({ dir }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {dir === 'left' ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
    </svg>
  )
}

/**
 * Sliding-window carousel shared by every home-page card section
 * (Best Tours, Destinations, Featured Places & Hotels).
 *
 * Pass the cards as children; PAGE_SIZE are visible at a time and the
 * prev/next arrows render only when there are more cards than fit in the
 * visible row, stepping one card at a time.
 */
export default function CardCarousel({
  children,
  pageSize = PAGE_SIZE,
  gridClassName = 'places-hotels-grid',
  emptyMessage,
  navLabel = 'items',
}) {
  const [start, setStart] = useState(0)
  const items = Children.toArray(children)

  const hasOverflow = items.length > pageSize
  const maxStart = Math.max(0, items.length - pageSize)
  const safeStart = Math.min(start, maxStart)
  const visible = items.slice(safeStart, safeStart + pageSize)

  if (items.length === 0) {
    return emptyMessage ? <p className="places-hotels-empty">{emptyMessage}</p> : null
  }

  return (
    <div className="places-hotels-carousel">
      {hasOverflow && (
        <button
          type="button"
          className="ph-nav ph-nav--prev"
          onClick={() => setStart(Math.max(0, safeStart - 1))}
          disabled={safeStart === 0}
          aria-label={`Previous ${navLabel}`}
        >
          <Chevron dir="left" />
        </button>
      )}

      <div className={gridClassName}>{visible}</div>

      {hasOverflow && (
        <button
          type="button"
          className="ph-nav ph-nav--next"
          onClick={() => setStart(Math.min(maxStart, safeStart + 1))}
          disabled={safeStart >= maxStart}
          aria-label={`Next ${navLabel}`}
        >
          <Chevron dir="right" />
        </button>
      )}
    </div>
  )
}
