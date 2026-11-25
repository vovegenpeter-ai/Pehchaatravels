# TikTok Pixel

Status: implemented with the site pixel ID **`DC3JSVJC77U703IGKRCG`** built in
(override with `NEXT_PUBLIC_TIKTOK_PIXEL_ID`). No remote TikTok setting was
touched by this change.

The official snippet's `ttq.load('DC3JSVJC77U703IGKRCG'); ttq.page();` is
executed by [lib/tiktok.js](lib/tiktok.js) after the visitor grants consent —
it is not pasted a second time in the layout `<head>`, because two copies of the
base code would send duplicate PageViews and events.

## What was added

| File | Role |
| --- | --- |
| [lib/tiktok.js](lib/tiktok.js) | Pixel loader (TikTok's documented `ttq` queue shim, with the pixel ID built in), `trackTikTokEvent`, `trackTikTokPage`, `disableTikTokCookies`. Every export is a no-op without consent. |
| [components/seo/TikTokPixel.jsx](components/seo/TikTokPixel.jsx) | Mounted in [app/layout.jsx](app/layout.jsx). Loads the pixel once the visitor grants consent and sends a PageView on the first page and every App Router navigation. |
| [lib/analytics.js](lib/analytics.js) | Existing `trackEvent` calls now go to GA4 **and** TikTok, mapped to TikTok standard events. No call site changed. |

## Consent

The pixel is gated on the existing banner ([components/ConsentBanner.jsx](components/ConsentBanner.jsx),
[lib/consent.js](lib/consent.js)) — the same `granted` value that enables PostHog
session replay:

- `unknown` / `denied`: no TikTok script is injected and `trackTikTokEvent` drops every event.
- `granted`: the pixel loads and cookies are written.
- Withdrawing consent calls `ttq.disableCookie()` and stops all further events
  (`disableCookie` stops new cookie/`ttclid` storage; the already-loaded SDK
  cannot be unloaded).

## Event mapping

| Site event (`EVENTS`) | TikTok standard event |
| --- | --- |
| `add_to_cart` | `AddToCart` |
| `begin_checkout` | `InitiateCheckout` |
| `purchase` | `CompletePayment` |
| `generate_lead` (contact + make-my-trip forms) | `SubmitForm` |
| `whatsapp_click` | `Contact` |
| `sign_up` | `CompleteRegistration` |
| `newsletter_subscribe` | `Subscribe` |

`value` / `currency` (`PKR`) are sent with cart, checkout and purchase events.

## Verify

1. Optionally set `NEXT_PUBLIC_TIKTOK_PIXEL_ID` to override the built-in ID
   (e.g. a staging pixel) and redeploy.
2. Open the site, click **Allow analytics**, then use TikTok's **Pixel Helper**
   browser extension (or Events Manager → Test Events) and confirm: one
   PageView per page navigation, `ViewContent`-free browsing, `AddToCart` when a
   tour is added, `InitiateCheckout` at checkout, `CompletePayment` after a
   booking, `SubmitForm` after the contact or make-my-trip form.
3. Click **Decline** (or clear site data and decline) and confirm the pixel no
   longer fires.

Optional next step if you want product-level ad reporting: send a `ViewContent`
event from the tour detail page (`app/tours/[slug]/page.jsx`) and enable the
TikTok **Events API** with a server-side access token — that needs a private
secret and is deliberately not part of this client-side install.
