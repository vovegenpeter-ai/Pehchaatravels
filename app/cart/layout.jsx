/**
 * Cart is a client component, so it cannot export `metadata` itself.
 * This layout carries the noindex directive: a cart page has no search value
 * and should never occupy an index slot.
 */
export const metadata = {
  robots: { index: false, follow: false },
}

export default function CartLayout({ children }) {
  return children
}
