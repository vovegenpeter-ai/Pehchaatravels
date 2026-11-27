# Meta (Facebook & Instagram) Pixel — setup, events and testing

Pixel ID: **set in `.env.local`** as `NEXT_PUBLIC_META_PIXEL_ID`. There is no
built-in default pixel, so nothing loads until you paste your own ID from Meta
Events Manager → **Data sources** → your pixel.

Only one pixel is installed. Meta's official base code lives in
[lib/metaPixel.js](lib/metaPixel.js) and is mounted once from
[app/layout.jsx](app/layout.jsx) through
[components/seo/MetaPixel.jsx](components/seo/MetaPixel.jsx). Do not also paste
the Events Manager snippet into the layout `<head>` — that would load the SDK
twice and double every event.

## Where things live

| File | Role |
| --- | --- |
| [lib/metaPixel.js](lib/metaPixel.js) | Loader (official base code), `trackMetaPage`, `trackMetaEvent`, `createMetaEventId`, `disableMetaCookies`. |
| [lib/analytics.js](lib/analytics.js) | Maps the site's own events to Meta standard events with documented parameters, next to the existing GA4/TikTok forwarding. |
| [components/seo/MetaPixel.jsx](components/seo/MetaPixel.jsx) | Mounts the pixel and sends one `PageView` per route change (admin excluded). |
| [components/seo/ViewContentTracker.jsx](components/seo/ViewContentTracker.jsx) | Fires `ViewContent` on tour, hotel and destination detail pages. |
| [components/seo/ClickTracking.jsx](components/seo/ClickTracking.jsx) | One click listener for `tel:`, `wa.me`, `mailto:` links and `/contact` buttons → `Contact`. |
| [components/ContactForm.jsx](components/ContactForm.jsx), [components/MakeMyTripForm.jsx](components/MakeMyTripForm.jsx) | `Lead` only after the API accepted the submission. |
| [app/checkout/page.jsx](app/checkout/page.jsx) | `InitiateCheckout` when the booking summary moves to payment; `Purchase` when the order is stored. |

## Events

| Meta event | Fires when | Key parameters |
| --- | --- | --- |
| `PageView` | The pixel loads and on every client-side route change (not on admin pages) | — |
| `ViewContent` | A tour, hotel or destination detail page opens | `content_ids`, `content_name`, `content_category`, `content_type`, `value`, `currency` |
| `Search` | The FAQ search box settles on a query (800 ms debounce, min 2 characters) | `search_string`, `content_category`, `content_type` |
| `Contact` | WhatsApp click, `tel:` click, `mailto:` click or a link to `/contact` | `content_name`, `content_category`, `content_ids` (page path) |
| `Lead` | Contact form or "Make My Trip" inquiry saved successfully | `content_name` (form), `content_ids` (method), `content_category` |
| `InitiateCheckout` | "Continue to Payment" on the booking summary — once per checkout | `content_ids`, `contents[]`, `num_items`, `value`, `currency` |
| `Purchase` | `/api/orders` created and stored the booking (not a duplicate retry) | `content_ids`, `contents[]`, `content_name`, `num_items`, `value`, `currency`, `eventID` |

`value` is always in PKR with `currency: "PKR"`. `contents[]` uses Meta's
documented shape `{ id, quantity, item_price }`; the site's own cart shape
(`content_id`, `price`) is converted in `lib/analytics.js`.

The site has no tour catalogue search box — the only in-site search is the FAQ
search, which is what `Search` reports. If a tour search is added later, call
`trackSearch(term, 'tours')` from `lib/analytics.js` and Meta receives it
automatically.

## No personal data

Meta is never sent a phone number or email address. The mappers in
`lib/analytics.js` whitelist product and funnel fields only, so the phone number
that the TikTok `Contact` event carries is dropped before the Meta call. Advanced
Matching (automatic email/phone matching) is deliberately left `off`:
`fbq('init', id)` is called without a matching payload.

## Correct triggers, no duplicates

- **One pixel.** `ensureMetaPixel()` installs the base code once per page load;
  a pre-existing `window.fbq` is reused instead of loaded again.
- **One PageView per page.** `components/seo/MetaPixel.jsx` is the only source
  of `PageView` and remembers the last tracked path, so React re-renders,
  StrictMode double effects and consent toggles cannot repeat it.
- **Purchase.** The order ID becomes Meta's `eventID`, and recent order IDs are
  remembered in `sessionStorage`, so a reload or a retried request cannot
  double-count a booking. A re-submitted booking that `/api/orders` reports as
  "Booking already exists." is not sent at all.
- **Lead.** Fired after `await fetchJson(...)` succeeds, so an invalid form
  (native `required` validation or an API rejection) never produces a `Lead`.
- **Admin.** `/admin` pages never load the pixel or send events.

## Purchase is a booking, not a card payment

This site takes no online card payment: checkout creates a `PENDING` order and
the team collects payment by bank transfer, JazzCash, EasyPaisa or cash.
`Purchase` therefore means "booking placed", with `value` equal to the order
total. If a real payment gateway is added later, fire `Purchase` from the
gateway's success callback instead.

## Consent

The pixel is gated on the existing cookie banner (`lib/consent.js`), the same
`granted` value that enables the TikTok pixel and PostHog replay:

- `unknown` / `denied`: no script is injected and every event is dropped.
- `granted`: the pixel loads and writes `_fbp`.
- Withdrawal calls `fbq('consent', 'revoke')` and stops further events.

## Configure the Pixel ID

1. Open [Meta Events Manager](https://business.facebook.com/events_manager) →
   **Data sources** → your pixel.
2. Copy the numeric Pixel ID (15–16 digits) from the pixel's settings.
3. Local: set it in `.env.local`:
   ```
   NEXT_PUBLIC_META_PIXEL_ID=123456789012345
   ```
4. Production: add the same variable in Vercel → Project Settings →
   Environment Variables, then redeploy.
5. Restart `npm run dev` — `NEXT_PUBLIC_*` values are inlined at build time.

## Verify

1. Install the **Meta Pixel Helper** Chrome extension.
2. Open the site and click **Allow analytics** on the cookie banner (the pixel
   is consent-gated, exactly like the TikTok pixel).
3. Pixel Helper should show the pixel ID with a green check, one `PageView`, and
   no errors. Browser console must stay free of `fbq` errors.
4. Navigate between pages: exactly one `PageView` per navigation.
5. Open a tour page → `ViewContent` with the tour's `content_ids`.
6. Search on `/faqs` → `Search` after the 800 ms debounce.
7. Click the floating WhatsApp button, a `tel:` link, a `mailto:` link and a
   "Contact Us" button → `Contact` (one event per click).
8. Submit the contact form or "Make My Trip" **with a required field empty** →
   no `Lead`; submit it validly → one `Lead`.
9. Add a tour → `/cart` → `/checkout` → **Continue to Payment** →
   `InitiateCheckout`. Complete the booking → `Purchase` with the order total.
10. Reload the confirmation state or resubmit the same booking → no second
    `Purchase`.
11. Events Manager → **Test events**: open the test-events tab, load the site
    with `?`-free URL, and watch the same stream arrive in real time; the
    browser and server columns should match.

Mobile: the same client code runs on mobile browsers; verify once in a real
device or responsive mode that PageView and Contact fire (tap targets are
unchanged by this integration).

Not covered: the Meta Conversions API (server-side). It needs a private access
token and is a separate integration; the `eventID` already emitted on
`Purchase` is what a future server-side event would reuse for deduplication.
