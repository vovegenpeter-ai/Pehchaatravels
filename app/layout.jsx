import LayoutShell from '@/components/LayoutShell'
import { CartProvider } from '@/lib/CartContext'
import './globals.css'

export const metadata = {
  title: 'Pehchaan Travels — Explore Pakistan',
  description: 'Discover breathtaking destinations, exciting tours, and unforgettable experiences with Pehchaan Travels.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <CartProvider>
          <LayoutShell>{children}</LayoutShell>
        </CartProvider>
      </body>
    </html>
  )
}
