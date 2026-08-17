export function getHotelPath(hotel) {
  return `/hotels/${hotel.slug || hotel.id}`
}

export function getDestinationPath(destination) {
  return `/destinations/${destination.slug || destination.id}`
}
