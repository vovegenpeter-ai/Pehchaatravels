/**
 * Forgot password is a client component, so it cannot export `metadata` itself.
 * This layout carries the noindex directive.
 */
export const metadata = {
  robots: { index: false, follow: false },
}

export default function ForgotPasswordLayout({ children }) {
  return children
}
