import LayoutShell from '@/components/LayoutShell'
import ConditionalWhatsApp from '@/components/ConditionalWhatsApp'
import ConditionalConsentBanner from '@/components/ConditionalConsentBanner'
import SmoothScroll from '@/components/SmoothScroll'
import Analytics from '@/components/seo/Analytics'
import TikTokPixel from '@/components/seo/TikTokPixel'
import ClickTracking from '@/components/seo/ClickTracking'
import JsonLd from '@/components/seo/JsonLd'
import { CartProvider } from '@/lib/CartContext'
import { AuthProvider } from '@/lib/AuthContext'
import { getCurrentUser } from '@/lib/auth'
import { getSocialMedia } from '@/lib/db'
import { SITE_URL, SITE_NAME, organizationSchema } from '@/lib/seo'
import './globals.css'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ffffff',
}

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Pehchaan Travels — Pakistan & Northern Areas Tour Packages',
    template: `%s — ${SITE_NAME}`,
  },
  description:
    'Curated tour packages across Northern Pakistan — Hunza, Skardu, Swat, Kashmir and Kumrat Valley — with departures from Lahore and Islamabad.',
  applicationName: SITE_NAME,
  keywords: [
    'Pakistan tour packages',
    'Northern Pakistan tours',
    'Hunza Valley tour package',
    'Skardu tour package',
    'Swat Kalam tour package',
    'Kashmir tour package',
    'tour packages from Lahore',
  ],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    siteName: SITE_NAME,
    url: SITE_URL,
  },
  // Google Search Console ownership token. Ignored until the env var is set —
  // add NEXT_PUBLIC_GSC_VERIFICATION in Vercel after verifying the domain.
  verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION }
    : undefined,
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
  const [user, social] = await Promise.allSettled([getCurrentUser(), getSocialMedia()])
  const currentUser = user.status === 'fulfilled' ? user.value : null
  const socialMedia = social.status === 'fulfilled' ? social.value : null

  const sameAs = [
    socialMedia?.facebookUrl,
    socialMedia?.instagramUrl,
    socialMedia?.youtubeUrl,
    socialMedia?.tiktokUrl,
  ].filter(Boolean)

  return (
    <html lang="en" style={{ backgroundColor: '#ffffff', colorScheme: 'light' }} suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light" />
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
        {/* Organization structured data — lets Google understand the brand,
            its contact points and its social profiles. Address is intentionally
            omitted until the office location is confirmed. */}
        <JsonLd data={organizationSchema({ sameAs })} />
        <SmoothScroll>
          <Analytics />
          <TikTokPixel />
          <ClickTracking />
          <AuthProvider initialUser={currentUser}>
            <CartProvider>
              <LayoutShell>{children}</LayoutShell>
              <ConditionalWhatsApp />
              <ConditionalConsentBanner />
            </CartProvider>
          </AuthProvider>
        </SmoothScroll>
      </body>
    </html>
  )
}
