import LayoutShell from '@/components/LayoutShell'
import ConditionalWhatsApp from '@/components/ConditionalWhatsApp'
import SmoothScroll from '@/components/SmoothScroll'
import { CartProvider } from '@/lib/CartContext'
import { AuthProvider } from '@/lib/AuthContext'
import { getCurrentUser } from '@/lib/auth'
import './globals.css'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1a4d3e',
}

export const metadata = {
  title: 'Pehchaan Travels — Explore Pakistan',
  description: 'Discover breathtaking destinations, exciting tours, and unforgettable experiences with Pehchaan Travels.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: '/apple-touch-icon.png',
    other: [
      { url: '/android-chrome-192x192.png', type: 'image/png', sizes: '192x192' },
      { url: '/android-chrome-512x512.png', type: 'image/png', sizes: '512x512' },
    ],
  },
}

export default async function RootLayout({ children }) {
  const user = await getCurrentUser()

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SmoothScroll>
          <AuthProvider initialUser={user}>
            <CartProvider>
              <LayoutShell>{children}</LayoutShell>
              <ConditionalWhatsApp />
            </CartProvider>
          </AuthProvider>
        </SmoothScroll>
      </body>
    </html>
  )
}
