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
  themeColor: '#ffffff',
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
    <html lang="en" style={{ backgroundColor: '#ffffff', colorScheme: 'light' }} suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light" />
        <meta name="theme-color" content="#ffffff" />
        {/* Edge/IE "Visual Search" extensions inject bis_skin_checked="1" attributes
            into the DOM before React hydrates, causing hydration mismatch errors
            ("A tree hydrated but some attributes... didn't match"). Strip them as
            they appear so React never sees the difference. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var RX=/^bis_/;function strip(n){if(n.nodeType!==1||!n.attributes)return;for(var a=n.attributes,i=a.length-1;i>=0;i--){if(RX.test(a[i].name)){n.removeAttribute(a[i].name)}}}try{new MutationObserver(function(ms){for(var k=0;k<ms.length;k++){var m=ms[k];if(m.type==='attributes'&&RX.test(m.attributeName||'')){strip(m.target)}else if(m.type==='childList'){for(var j=0;j<m.addedNodes.length;j++){strip(m.addedNodes[j])}}}}).observe(document,{attributes:true,childList:true,subtree:true})}catch(e){}})();",
          }}
        />
      </head>
      <body style={{ backgroundColor: '#ffffff', colorScheme: 'light', minHeight: '100vh' }} suppressHydrationWarning>
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
