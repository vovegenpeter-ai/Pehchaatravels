'use client'

import Script from 'next/script'

/**
 * Tawk.to live chat widget.
 *
 * Renders nothing and loads nothing until NEXT_PUBLIC_TAWK_PROPERTY_ID and
 * NEXT_PUBLIC_TAWK_WIDGET_ID are set, so the site behaves exactly as it did
 * before the chat was configured.
 *
 * Both ids come from the embed URL in Tawk.to → Administration → Channels →
 * Chat Widget → Widget Code: https://embed.tawk.to/<propertyId>/<widgetId>.
 * The widget id is usually `default`.
 *
 * Set the variables in Vercel → Project Settings → Environment Variables, then
 * redeploy. They are public by design (they only identify the widget).
 *
 * Loading strategy: `lazyOnload` runs after the page has finished loading, so
 * the chat iframe never competes with content, fonts or the booking flow.
 * The widget lives in the root layout, so client-side navigation neither
 * reloads it nor creates a second instance; the injected <script> is tagged
 * and guarded in case the component is ever mounted twice in development.
 *
 * Positioning: the launcher is raised 96px from the bottom edge so the
 * floating WhatsApp button can sit below it without overlap. Tawk reads
 * `Tawk_API.customStyle` during boot, so it is set before the widget script
 * is inserted.
 */
export const TAWK_PROPERTY_ID = (process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID || '').trim()
export const TAWK_WIDGET_ID = (process.env.NEXT_PUBLIC_TAWK_WIDGET_ID || '').trim()

export default function TawkTo() {
  if (!TAWK_PROPERTY_ID || !TAWK_WIDGET_ID) return null

  const widgetUrl = `https://embed.tawk.to/${encodeURIComponent(
    TAWK_PROPERTY_ID
  )}/${encodeURIComponent(TAWK_WIDGET_ID)}`

  return (
    <Script id="tawk-to" strategy="lazyOnload">
      {`
        (function () {
          if (window.Tawk_API && window.Tawk_API.embed) return;
          if (document.getElementById('tawk-to-script')) return;
          window.Tawk_API = window.Tawk_API || {};
          window.Tawk_LoadStart = new Date();
          window.Tawk_API.customStyle = {
            visibility: {
              desktop: { position: 'br', xOffset: 22, yOffset: 96 },
              mobile: { position: 'br', xOffset: 22, yOffset: 96 },
            },
          };
          var s1 = document.createElement('script');
          s1.id = 'tawk-to-script';
          s1.async = true;
          s1.src = '${widgetUrl}';
          s1.charset = 'UTF-8';
          s1.setAttribute('crossorigin', '*');
          var s0 = document.getElementsByTagName('script')[0];
          s0.parentNode.insertBefore(s1, s0);
        })();
      `}
    </Script>
  )
}
