# TikTok Pixel — events and parameters

Pixel ID: **`DC3JSVJC77U703IGKRCG`** (built into [lib/tiktok.js](lib/tiktok.js);
`NEXT_PUBLIC_TIKTOK_PIXEL_ID` overrides it, e.g. for a staging pixel).

Only one pixel is installed. TikTok's base code (`ttq.load` + `ttq.page`) lives
in [lib/tiktok.js](lib/tiktok.js) and is mounted once from
[app/layout.jsx](app/layout.jsx). Do not paste the Events Manager snippet into
the layout `<head>` as well — that would load the SDK twice and double every
event.

## Where things live

| File | Role |
| --- | --- |
| [lib/tiktok.js](lib/tiktok.js) | Loader (TikTok's `ttq` queue shim), `trackTikTokPage`, `trackTikTokEvent`, `createEventId`, `disableTikTokCookies`. |
| [lib/analytics.js](lib/analytics.js) | Maps the site's own events to TikTok standard events with documented parameters, forwards the same calls to GA4, and deduplicates purchases. |
| [components/seo/TikTokPixel.jsx](components/seo/TikTokPixel.jsx) | Mounts the pixel and sends one PageView per route change (admin excluded). |
| [components/seo/ViewContentTracker.jsx](components/seo/ViewContentTracker.jsx) | Fires `ViewContent` on tour, hotel and destination detail pages. |
| [components/seo/ClickTracking.jsx](components/seo/ClickTracking.jsx) | One click listener for every `tel:` link and `wa.me` link on the site → `Contact`. |

## Events

| TikTok event | Fires when | Key parameters |
| --- | --- | --- |
| `PageView` | The pixel loads and on every client-side route change (not on admin pages) | — |
| `ViewContent` | A tour, hotel or destination detail page opens | `content_id`, `content_ids`, `content_name`, `content_type` (`product` / `hotel` / `destination`), `content_category`, `contents[]`, `value`, `currency` |
| `Search` | The FAQ search box settles on a query (800 ms debounce, min 2 characters) | `search_string`, `content_category` |
| `AddToCart` | "Book Now" adds a tour to the cart (single or couple package) | `content_id`, `content_ids`, `content_name`, `content_type`, `content_category`, `contents[]`, `value`, `currency`, `quantity` |
| `InitiateCheckout` | "Continue to Payment" is pressed on the booking summary — once per checkout | `contents[]`, `content_ids`, `value`, `currency`, `quantity` |
| `AddPaymentInfo` | The payment step opens, and on each different method the visitor picks — once per method | `content_name` (method), `content_category`, `contents[]`, `value`, `currency` |
| `Purchase` | The booking is created and stored by `/api/orders` | `contents[]`, `content_ids`, `content_name`, `value`, `currency`, `quantity`, `description`, plus `event_id` |
| `SubmitForm` | Contact form or "Make My Trip" request saved successfully | `content_name` (form), `content_id` (method), `content_category` |
| `Contact` | WhatsApp click (floating button, FAQ CTA) or any `tel:` link click | `content_name`, `content_category`, `content_id` (page path) |
| `CompleteRegistration` | Account created on `/sign-up` | `content_name`, `content_category`, `content_id` |
| `Subscribe` | Newsletter subscription succeeds in the footer | `content_name`, `content_category` |

`value` is always in PKR with `currency: "PKR"`. Tour prices use the selected
package rate (single or couple), and `contents[].quantity` is the number of
packages booked.

### `content_id`

TikTok's "Content ID is missing in your events" diagnostic flags events without
`content_id`, so every event now carries one:

- tours/hotels/destinations use the page's slug (the same ID the URL and
  catalog feed would use);
- cart, checkout, payment and purchase use the first booked tour's slug, with
  every item still listed in `contents[]` and `content_ids[]`;
- non-product events use a stable site ID: `contact_page` / `make_my_trip`,
  `/the-page-path` for Contact, `email` for registration, `newsletter`, and
  `<area>-search` for Search.

`PageView` is the one exception: TikTok's `ttq.page()` takes no properties, so
page views cannot carry a `content_id`.

## Correct triggers, no duplicates

- **One pixel.** Verified: a single `#tiktok-pixel-sdk` script and one `ttq`
  instance; nothing else in the codebase references `analytics.tiktok.com`.
- **SPA pageviews.** The pixel's own history observer is disabled
  (`ttq.load(id, { historyObserver: false })`) because the app calls `ttq.page()`
  itself on each navigation. Otherwise every route change would be counted twice.
- **Purchase.** Goes through `event_id` (`pehchaan-<orderId>`) so the same order
  can never be counted twice, and `/api/orders` answering "Booking already
  exists." for a re-submitted booking does **not** report a conversion. Recent
  order IDs are also remembered in `sessionStorage`.
- **InitiateCheckout / AddPaymentInfo.** Guarded by refs, so going back and
  forth in the two-step checkout does not re-send them.
- **Contact.** The floating WhatsApp button reports itself; the global click
  listener skips it, so one click is one `Contact`.
- **Admin.** `/admin` pages never load the pixel or send events.

## Purchase is a booking, not a card payment

This site takes no online card payment: checkout creates a `PENDING` order and
the team collects payment by bank transfer, JazzCash, EasyPaisa or cash. The
`Purchase` event therefore means "booking placed", with `value` equal to the
order total and the chosen method in `description`. If you later add a real
payment gateway, fire it on the gateway's success callback instead.

## Consent

The pixel is gated on the existing banner ([lib/consent.js](lib/consent.js)) —
the same `granted` value that enables PostHog session replay:

- `unknown` / `denied`: no script is injected and every event is dropped.
- `granted`: the pixel loads and writes `_ttp`.
- Withdrawal calls `ttq.disableCookie()` and stops further events.

Nothing loads before the visitor clicks **Allow analytics**, so ad traffic that
ignores or declines the banner is not attributed.

## Verify

1. Open the site, click **Allow analytics**.
2. Network tab: one request to
   `analytics.tiktok.com/i18n/pixel/events.js?sdkid=DC3JSVJC77U703IGKRCG&lib=ttq`.
3. Navigate between pages: exactly one `PageView` per navigation (TikTok Pixel
   Helper shows this, and no duplicate).
4. Open a tour page → `ViewContent`; add it to the cart → `AddToCart`; continue
   to payment → `InitiateCheckout`, then `AddPaymentInfo`; complete the booking
   → `Purchase` with the order total.
5. Events Manager → **Test Events** shows the same stream in real time.

Not covered: the TikTok Events API (server-side). It needs a private access
token and is a separate integration.
