export function getTourPath(tour) {
  return `/tours/${tour.slug || tour.id}`
}

export function formatPrice(price) {
  return Number(price || 0).toLocaleString('en-US')
}
