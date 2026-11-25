/**
 * Bookings is a client component, so it cannot export `metadata` itself.
 * This layout carries the noindex directive for the account area.
 */
export const metadata = {
  robots: { index: false, follow: false },
}

export default function BookingsLayout({ children }) {
  return children
}
