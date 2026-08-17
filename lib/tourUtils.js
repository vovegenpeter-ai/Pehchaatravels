export function getTourPath(tour) {
  return `/tours/${tour.slug || tour.id}`
}

export function formatPrice(price) {
  return price.toLocaleString('en-US')
}
