'use client'

import Script from 'next/script'

/**
 * Google Analytics 4 loader.
 *
 * Renders nothing and loads nothing until NEXT_PUBLIC_GA_MEASUREMENT_ID is
 * set, so the site behaves exactly as before until Analytics is configured.
 *
 * Set the ID in Vercel → Project Settings → Environment Variables, then
 * redeploy. Data stays in the property owner's GA4 account.
 */
export const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''

export default function Analytics() {
  if (!GA_ID) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { anonymize_ip: true });
        `}
      </Script>
    </>
  )
}
