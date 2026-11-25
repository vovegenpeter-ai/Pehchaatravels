/**
 * Checkout is a client component, so it cannot export `metadata` itself.
 * This layout carries the noindex directive for the whole checkout flow.
 */
export const metadata = {
  robots: { index: false, follow: false },
}

export default function CheckoutLayout({ children }) {
  return children
}
