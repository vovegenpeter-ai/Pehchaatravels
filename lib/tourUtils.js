export function getTourPath(tour) {
  return `/tours/${tour.slug || tour.id}`
}

export function formatPrice(price) {
  return Number(price || 0).toLocaleString('en-US')
}

/**
 * Platform/service charge applied at checkout (fraction of subtotal).
 * Change here once — cart, checkout, orders API and emails stay in sync.
 */
export const TAX_RATE = 0
export const TAX_LABEL = 'Service Charges'

/** Booking price breakdown used by cart, checkout and the orders API. */
export function priceBreakdown(subtotal) {
  const base = Number(subtotal || 0)
  const taxes = Math.round(base * TAX_RATE)
  return { subtotal: base, taxes, total: base + taxes }
}
