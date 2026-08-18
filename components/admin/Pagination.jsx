import Link from 'next/link'

export default function Pagination({ currentPage, totalPages, basePath, extraParams }) {
  if (totalPages <= 1) return null

  const qs = extraParams ? '?' + new URLSearchParams(extraParams).toString() + '&' : '?'
  const href = (p) => `${basePath}${qs}page=${p}`

  // Compact page list: always show first/last, plus neighbours of the current page.
  const items = []
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1) {
      items.push(p)
    } else if (items[items.length - 1] !== '…') {
      items.push('…')
    }
  }

  return (
    <nav className="admin-pagination" aria-label="Pagination">
      {currentPage > 1 ? (
        <Link href={href(currentPage - 1)} className="admin-pagination__btn" aria-label="Previous page">‹ Prev</Link>
      ) : (
        <span className="admin-pagination__btn admin-pagination__btn--disabled" aria-disabled="true">‹ Prev</span>
      )}
      {items.map((item, i) =>
        item === '…' ? (
          <span key={`ellipsis-${i}`} className="admin-pagination__ellipsis">…</span>
        ) : (
          <Link
            key={item}
            href={href(item)}
            className={`admin-pagination__btn${item === currentPage ? ' admin-pagination__btn--active' : ''}`}
            aria-current={item === currentPage ? 'page' : undefined}
          >
            {item}
          </Link>
        )
      )}
      {currentPage < totalPages ? (
        <Link href={href(currentPage + 1)} className="admin-pagination__btn" aria-label="Next page">Next ›</Link>
      ) : (
        <span className="admin-pagination__btn admin-pagination__btn--disabled" aria-disabled="true">Next ›</span>
      )}
    </nav>
  )
}
