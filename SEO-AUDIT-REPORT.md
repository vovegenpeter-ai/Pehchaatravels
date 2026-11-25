# Pehchaan Travels — SEO Audit & Implementation Report

**Site:** https://pehchaantravels.pk
**Stack:** Next.js 15 (App Router) · React 19 · Prisma + MongoDB Atlas · Cloudinary images · deployed on Vercel
**Scope:** Full-site technical + on-page SEO audit, implementation of highest-priority fixes, keyword map and 30-day plan.
**Report date:** 24 October 2026

> **Honesty notes up front**
> - Nothing in this report claims a ranking, traffic or first-page guarantee.
> - Google Search Console **has not been verified or submitted** — that needs account access you hold (see §12).
> - Google Analytics 4 **is wired up but not active** — no measurement ID has been supplied (see §11).
> - Core Web Vitals field numbers **were not measurable in this environment** (see §10).
> - No reviews, ratings, prices, addresses or business details were invented anywhere.

---

## 1. Executive summary

The site had a working React application but was effectively **invisible to technical SEO**: no XML sitemap, no `robots.txt`, no canonical tags, no Open Graph metadata, no structured data, generic page titles reused across pages, and several private/account URLs openly indexable.

The highest-priority fixes are now **implemented in the codebase**:

| Area | Before | After |
|---|---|---|
| XML sitemap | Absent | `app/sitemap.js` — static + DB-driven, 1-hour revalidation |
| `robots.txt` | Absent | `app/robots.js` — allows public, blocks admin/account/cart |
| Canonical URLs | Absent | Every public page emits an absolute canonical |
| Title tags | Generic / duplicated | Unique, keyword-mapped, ≤ 59 characters |
| Meta descriptions | Mostly absent | Unique, ≤ 160 characters, on every public page |
| Open Graph / Twitter | Absent | Full OG + Twitter card set on every public page |
| Structured data | Absent | `TravelAgency`, `BreadcrumbList`, `TouristTrip`+`Offer`, `FAQPage`, conditional `AggregateRating` |
| Index bloat | Cart/checkout/profile/account indexable | `noindex` layouts + `robots` disallow |
| Duplicate URLs | `/tours/<dbid>` and `/tours/<slug>` both served | 308 redirect to canonical slug |
| Image alt text | `alt={tour.name}` / `Tour photo 1` | Descriptive, keyword-bearing alt text + width/height |
| Internal linking | Footer linked to generic labels only | Keyword-rich footer links, FAQ/privacy added, 404 recovery links |
| Analytics | None | GA4 loader + 8 conversion events (dormant until ID is set) |

---

## 2. Issues found in the audit

### 2.1 Critical (indexing / discoverability)

| # | Issue | Evidence |
|---|---|---|
| C1 | No `robots.txt` | `GET /robots.txt` → 404 |
| C2 | No XML sitemap | `GET /sitemap.xml` → 404 |
| C3 | No canonical URLs on any page | Rendered `<head>` had no `rel=canonical` |
| C4 | No `title`/`description` metadata on homepage, tour and place pages | `app/page.jsx` exported no `metadata` |
| C5 | Cart, checkout, profile, bookings, password pages fully indexable | Client components could not export `metadata` |
| C6 | Private `/admin` area crawlable | No `robots` rule, no sitemap exclusion |
| C7 | Tour detail pages served two indexable URLs (DB id **and** slug) | `getTourBySlugOrId()` accepts both, no redirect |
| C8 | `/faq` and `/faqs` both reachable → duplicate content risk | No redirect configured |

### 2.2 High (on-page / relevance)

| # | Issue |
|---|---|
| H1 | Title tags duplicated the brand twice (`About Pehchaan Travels — Pakistan Tour Operator — Pehchaan Travels`) and overflowed the ~60-character SERP cut-off |
| H2 | Meta descriptions either missing or raw HTML copied straight from the database |
| H3 | No structured data at all — no organisation, breadcrumbs, product/offer or FAQ markup |
| H4 | Alt text was non-descriptive: `alt={tour.name}`, `alt="Tour photo 1"` |
| H5 | Gallery images shipped without `width`/`height` → cumulative layout shift |
| H6 | Footer — the site's strongest internal-link block — used bare labels ("Tours", "Places") and omitted FAQs, Privacy and Custom Tours |
| H7 | 404 page offered a single "Go Home" link; it also double-wrapped `LayoutShell`, rendering header/footer twice |
| H8 | Tour detail pages had admin-authored FAQs visible on the page but **no** `FAQPage` markup |
| H9 | No breadcrumbs → no hierarchy signal for deep place/tour pages |

### 2.3 Medium

| # | Issue |
|---|---|
| M1 | Two different office addresses appear on the site → `PostalAddress` deliberately **not** emitted rather than guessed |
| M2 | No GA4 / GSC integration present |
| M3 | No conversion events for inquiries, WhatsApp clicks, form submits or bookings |
| M4 | Root fallback title was 65 characters |
| M5 | `/contact` and the root layout both emitted a `TravelAgency` node → competing duplicate entities |
| M6 | Four pages emitted the `BreadcrumbList` schema **twice** (once via `<Breadcrumbs>`, once via an explicit `<JsonLd>`) |
| M7 | `next.config.mjs` sets `imageformats: avif/webp` but no explicit lazy/eager strategy or `sizes` on responsive images |
| M8 | `poweredByHeader: false` was already set (good) but HTTPS/canonical host normalisation was undefined — `metadataBase` absent |

### 2.4 Deliberately **not** changed

- **No design or layout changes.** Breadcrumbs are emitted as invisible JSON-LD only; no visible breadcrumb trail was added.
- **No content was rewritten** where it carries factual tour detail — prices, inclusions, exclusions, itineraries and booking terms are untouched.
- **No reviews or star ratings were synthesised.** `AggregateRating` is emitted *only* when approved reviews genuinely exist in the database (§8.5).
- **No `PostalAddress` in schema** until the real office address is confirmed.
- **No `TravelAgency`-style spam or doorway pages** were generated.

---

## 3. Issues fixed (implemented in code)

### 3.1 Technical SEO

| Fix | File(s) |
|---|---|
| Dynamic XML sitemap: 10 static marketing pages + all published tours, destinations, place categories and hotels, with `lastModified` from the database | `app/sitemap.js`, `lib/db.ts` (`getSitemapEntries`) |
| `robots.txt` allowing public content, disallowing `/admin`, `/api/`, `/cart`, `/checkout`, `/profile`, `/bookings`, sign-in/up and password routes, and declaring `Sitemap:` + `Host:` | `app/robots.js` |
| Absolute canonical URL on every public page, anchored by `metadataBase` | `lib/seo.js` (`buildMetadata`, `absoluteUrl`), `app/layout.jsx` |
| Canonical host is forced to `https://pehchaantravels.pk` via `NEXT_PUBLIC_SITE_URL` so staging/preview URLs never leak into canonicals | `lib/seo.js`, `.env.example` |
| 308 redirect from `/tours/<dbid>` → `/tours/<slug>` (and the same for destinations) so link equity consolidates | `app/tours/[slug]/page.jsx`, `app/destinations/[slug]/page.jsx` |
| 301 redirect `/faq` → `/faqs` | `next.config.mjs` |
| `noindex, nofollow` on cart, checkout, profile, bookings and forgot-password (client pages that cannot export `metadata`) | `app/cart/layout.jsx`, `app/checkout/layout.jsx`, `app/profile/layout.jsx`, `app/bookings/layout.jsx`, `app/forgot-password/layout.jsx` |
| `noindex` also applied to sign-in, sign-up, reset-password, checkout-success | `app/sign-in/page.jsx`, `app/sign-up/page.jsx`, `app/reset-password/page.jsx`, `app/checkout/success/page.jsx` |
| Double `LayoutShell` wrapper removed from the 404 page, plus recovery links | `app/not-found.jsx` |
| Unused/legacy admin redirects preserved; existing redirects untouched | `next.config.mjs` |

### 3.2 On-page metadata

Every public page now has a unique, keyword-mapped title, meta description, canonical, OG/Twitter tags and keyword terms via one shared helper — `buildMetadata()` in `lib/seo.js` (clamps titles to 45 chars + 19-char brand suffix, descriptions to 160).

Pages updated: `/`, `/tours`, `/places`, `/hotels`, `/faqs`, `/about`, `/contact`, `/make-my-trip`, `/privacy`, `/terms`, plus dynamic `tours/[slug]`, `destinations/[slug]`, `places/[categorySlug]`, `hotels/[slug]`.

### 3.3 Headings

Verified **exactly one `<h1>` per indexable page**:

| Page | H1 |
|---|---|
| `/` | Hero title (dynamic) |
| `/tours` | PageHero title |
| `/hotels` | PageHero title |
| `/places` | "Places to visit" hero title |
| `/faqs` | "Frequently Asked Questions" |
| `/about` | "About Us" |
| `/contact` | "Contact Us" |
| `/make-my-trip` | "Make Your Own Trip" |
| `/tours/[slug]` | `tour.name` |
| `/destinations/[slug]` | `destination.name` |
| `/places/[categorySlug]` | category name |
| `/hotels/[slug]` | `hotel.name` |
| `/privacy`, `/terms` | Page title |

H2/H3 hierarchy was already consistent (section titles → card titles) and was left alone; the only heading change was exposing the tour **Duration** as a labelled `InfoItem` so the fact is present as text, not only in the summary sidebar.

### 3.4 Image alt text & markup

| Component | Before | After |
|---|---|---|
| `TourCard` | `alt={tour.name}` | `alt="<name> — <destination> tour package photo"` |
| `PlaceCard` | `alt={place.name}` | `alt="<name> — tourist places and things to do"` |
| `HotelCard` | `alt={hotel.name}` | `alt="<name> — hotel in <location>"` |
| `ImageGallery` | `alt="Tour photo 1"` | `alt="<tour name> photo N of T"` **+ `loading="lazy"` + `width`/`height`** |
| Destination related-cards | — | `alt="<name> — places to visit and tours"` |
| Info icons | visible to AT | `aria-hidden="true"` |

**Image file names** are stored in Cloudinary by the admin upload flow; renaming them is a content-operations task, not a code change (see §12).

### 3.5 Internal linking

- **Footer (site-wide, highest-value block):** labels upgraded to "Tour Packages", "Places to Visit", "Hotels & Stays"; added **Custom Tours**, **FAQs**, **Privacy Policy**; added a NAP block with `tel:` and `mailto:` links.
- **404 page:** now links to `/tours` and `/places` in addition to home.
- **Contact page:** links to `/faqs` with anchor text describing deposit/cancellation content.
- **Tour detail:** related-tour cards, plus breadcrumbs (JSON-LD) expressing the `Home → Tour Packages → <tour>` hierarchy.
- **Destination pages:** related-destination cards, `Tours in <name>` and `Hotels in <name>` sections.

### 3.6 Local SEO / NAP consistency

- Phone and email are now sourced from one constant (`lib/initialData.js`) in the footer, contact page and WhatsApp button — no divergent copies.
- The slogan is identical in footer and `TravelAgency` schema.
- `areaServed` declares Pakistan, Lahore and Islamabad; `areaServed: 'PK'` on the reservations contact point.
- **Address remains intentionally omitted from structured data** because the site currently shows two different office locations — publishing a guessed address would violate Google's structured-data policy. Confirm the real address (§12).

---

## 4. Final titles & meta descriptions

All titles are ≤ 59 characters including the ` — Pehchaan Travels` suffix (measured; longest is `/tours` at 59).

| URL | Title tag | Meta description |
|---|---|---|
| `/` | Pakistan Tour Packages from Lahore — Pehchaan Travels | Guided tour packages across Northern Pakistan — Hunza, Skardu, Swat, Kashmir and Kumrat Valley — with departures from Lahore and Islamabad for families and couples. |
| `/tours` | Pakistan Tour Packages — Group & Private — Pehchaan Travels | Every Pakistan tour package we run, covering Hunza, Skardu, Swat, Kashmir, Kumrat and Fairy Meadows — with group departures and private tours from Lahore and Islamabad. |
| `/places` | Places to Visit in Northern Pakistan — Pehchaan Travels | Explore the destinations we cover across Northern Pakistan — Hunza and Skardu in Gilgit-Baltistan to the valleys of Swat, Kumrat and Neelum. Browse by region. |
| `/hotels` | Hotels in Northern Pakistan — Pehchaan Travels | Browse the hotels and resorts we book across Hunza, Skardu, Swat, Gilgit and the Kaghan Valley, with per-night prices, amenities and room types for each stay. |
| `/faqs` | Tour Booking FAQs & Cancellation Rules — Pehchaan Travels | Answers to common questions about booking a Pakistan tour: the 40% advance deposit, payment methods, what packages include, cancellation rules, hotels, safety and what to pack. |
| `/about` | About Our Pakistan Tour Operator — Pehchaan Travels | Pehchaan Travels runs group and private tours across Pakistan — Hunza, Skardu, Naran, Swat and Kashmir — with experienced guides, private transport and handpicked hotels. |
| `/contact` | Contact & Tour Enquiries — Pehchaan Travels | Questions about a tour package, a custom itinerary or a hotel booking? Call, WhatsApp or message Pehchaan Travels and we will reply with dates, prices and availability. |
| `/make-my-trip` | Custom Pakistan Tour Package — Pehchaan Travels | Tell us where you want to go, your travel dates, group size and budget, and we will design a private Pakistan tour itinerary with an exact quote. Families, couples and corporate groups welcome. |
| `/privacy` | Privacy Policy — Pehchaan Travels | How Pehchaan Travels collects, uses, and protects your personal information. |
| `/terms` | Terms of Service — Pehchaan Travels | Terms and conditions for using Pehchaan Travels services and booking tours in Pakistan. |
| `/tours/<slug>` | `<tour name> — <destination> Tour — Pehchaan Travels` | `<summary> <duration> from PKR <price> per person. Full itinerary, inclusions and booking details.` |
| `/destinations/<slug>` | `<name> — Places to Visit, Tours & Hotels — Pehchaan Travels` | `<blurb> See the tour packages and hotels available in <name>.` |
| `/places/<category>` | `<name> — Places to Visit & Tour Packages — Pehchaan Travels` | `<blurb> Explore the <name> destinations we cover, with tour packages, itineraries and hotels for each place.` |
| `/hotels/<slug>` | `<hotel> — <location> Hotel — Pehchaan Travels` | `<blurb> PKR <price> per night in <location>. Check-in times, amenities and booking.` |

Titles that also had a **duplicated brand** were corrected: `/about` no longer repeats "Pehchaan Travels" twice.

---

## 5. Keyword-to-page mapping

**Rule applied:** one primary keyword cluster per page. Destination keywords live on their own place/destination pages and are *not* repeated on the homepage or `/tours`.

### 5.1 Head terms

| Page | Primary keyword | Secondary / supporting | Intent |
|---|---|---|---|
| `/` | pakistan tour packages | northern pakistan tour packages, tour packages from Lahore | Commercial |
| `/tours` | pakistan tour packages (group & private) | private tour packages Pakistan, group tour Pakistan, tour packages Islamabad | Commercial |
| `/tours/[slug]` *(dynamic)* | `<destination> tour package` | `<tour name> price`, pakistan family tour package, northern areas tour | Transactional |
| `/places` | places to visit in northern pakistan | northern areas tourist places, northern pakistan destinations | Informational |
| `/places/[category]` *(dynamic)* | places to visit in `<region>` | `<region> tourist places`, `<region> tour package` | Informational → Commercial |
| `/destinations/[slug]` *(dynamic)* | `<place> tourist places` | things to do in `<place>`, `<place> tour package`, `<place> hotels` | Informational |
| `/hotels` | hotels in northern pakistan | hunza hotels, skardu hotels, swat hotels, kaghan valley hotels | Commercial |
| `/hotels/[slug]` *(dynamic)* | `<hotel name> <location>` | hotels in `<location>` with price | Transactional |
| `/make-my-trip` | custom tour packages pakistan | private tour Pakistan price, family trip planner Lahore, corporate tour Pakistan | Transactional |
| `/faqs` | pakistan tour booking faqs | tour deposit policy Pakistan, tour cancellation policy | Informational |
| `/about` | pakistan tour operator | travel agency Lahore, Northern Pakistan travel agency | Commercial-investigation |
| `/contact` | Pehchaan Travels contact | tour operator contact Pakistan | Navigational |

### 5.2 Your requested keyword list → owner page

| Requested keyword | Owner page (exists now) | Status |
|---|---|---|
| Pakistan tour packages | `/` + `/tours` | ✅ Implemented |
| Northern Pakistan tour packages | `/` (secondary), `/places` | ✅ Implemented |
| Swat Kalam tour package | `/places/<swat>` → destinations | ✅ Route exists — **content-dependent** |
| Kashmir tour package | `/places/<kashmir>` → destinations | ✅ Route exists — **content-dependent** |
| Skardu tour package | `/places/<skardu>` → destinations | ✅ Route exists — **content-dependent** |
| Hunza Valley tour package | `/places/<hunza>` → destinations | ✅ Route exists — **content-dependent** |
| Kumrat Valley tour package | `/places/<kumrat>` → destinations | ✅ Route exists — **content-dependent** |
| Lahore to Northern Areas tours | **No dedicated page** | ⚠️ Recommended new page (§7) |
| Couple tour packages in Pakistan | **No dedicated page** | ⚠️ Recommended new page (§7) |
| Family tour packages in Pakistan | `/` secondary only | ⚠️ Recommended new page (§7) |
| Private vs group tours in Pakistan | `/tours` secondary only | ⚠️ Recommended new page (§7) |

**Important:** the five region keywords are only winnable if the corresponding category/destination pages have substantive unique copy. The routes and metadata templates exist; the actual copy lives in the database and must be authored in the admin area (§12).

### 5.3 Long-tail clusters to target

- `hunza valley tour package from lahore price`
- `skardu 5 days tour package cost`
- `swat kalam tour package 2026`
- `neelum valley couple trip pakistan`
- `kumrat valley group tour`
- `fairy meadows tour package pakistan`
- `naran kaghan family tour package`
- `northern areas tour by air from lahore`
- `private jeep tour skardu hunza`
- `winter tours northern pakistan`

> **No search-volume or keyword-difficulty numbers are stated here.** Those require Google Keyword Planner or your live Google Search Console data — inventing them would be misleading. See §12.

---

## 6. Structured data (Schema.org)

| Schema | Where | Source of truth |
|---|---|---|
| `TravelAgency` (+ `contactPoint`, `sameAs` social profiles) | Every page (root layout) | `lib/seo.js` `BUSINESS`, real phone/email/social URLs |
| `BreadcrumbList` | `/tours`, `/places/*`, `/destinations/*`, `/hotels*`, `/about`, `/contact`, `/faqs`, `/make-my-trip` | `<components/seo/Breadcrumbs>` — invisible, no visual change |
| `TouristTrip` + `Offer` (+ optional `UnitPriceSpecification` for couple pricing) | `/tours/[slug]` | Live DB price, itinerary, provider |
| `FAQPage` | `/faqs`, `/tours/[slug]` | Only FAQs genuinely rendered on the page |
| `AggregateRating` | `/tours/[slug]` | **Suppressed entirely unless approved reviews exist** (`getTourReviewStats`, `status: 'approved'`) |
| `PostalAddress` | — | **Deliberately omitted** pending address confirmation |

### Validation results

Every `<script type="application/ld+json">` block on the rendered pages was extracted and run through `JSON.parse`:

```
/faqs          3 blocks — TravelAgency, BreadcrumbList, FAQPage   → 3 valid, 0 invalid
/about         2 blocks — TravelAgency, BreadcrumbList            → 2 valid, 0 invalid
/contact       2 blocks — TravelAgency, BreadcrumbList            → 2 valid, 0 invalid
/make-my-trip  2 blocks — TravelAgency, BreadcrumbList            → 2 valid, 0 invalid
/privacy       1 block  — TravelAgency                            → 1 valid, 0 invalid
/terms         1 block  — TravelAgency                            → 1 valid, 0 invalid
```

Duplicate-schema defects found and fixed during verification:

1. `/contact` emitted a **second, competing `TravelAgency`** alongside the root-layout one → the `contactPoint` was merged into the single shared `TravelAgency`; the page-level duplicate was removed.
2. Four pages (`/tours/[slug]`, `/destinations/[slug]`, `/places/[categorySlug]`, `/hotels/[slug]`) emitted `BreadcrumbList` **twice** — once through `<Breadcrumbs>`, once through an explicit `<JsonLd>` → the explicit copies were removed.

DB-backed pages (`/tours`, `/places/*`, `/hotels/*`, `/`, `/destinations/*`) could not be rendered for schema validation because the MongoDB Atlas cluster is unreachable from this machine (§10). Their schema is compile-verified only.

---

## 7. Content recommendations (not built)

These are recommended, **not implemented** — each needs genuinely unique, hand-written content, and doorway-style auto-generation would violate Google's guidelines.

| Recommended page | Target keyword | Rationale |
|---|---|---|
| `/tours/lahore-to-northern-areas` | Lahore to Northern Areas tours | Explicitly searched; no page owns it |
| `/tours/family-packages` | family tour packages Pakistan | High intent, distinct from couple/corporate |
| `/tours/couple-packages` | couple tour packages Pakistan | Distinct pricing and itinerary intent |
| `/tours/private-vs-group` | private vs group tours Pakistan | Comparison intent, supports `/tours` |
| Destination guides (1 per region) | `<region> travel guide`, best time to visit | Informational top-of-funnel; supports category pages |
| `/blog/` with itinerary posts | long-tail itinerary queries | Only publish if genuinely useful and unique |

Existing content that should be enriched **in the admin panel** (not code): category `longDescription`, destination `fullDescription`, and per-tour FAQ lists.

---

## 8. Performance & Core Web Vitals

### What changed

| Change | Metric affected |
|---|---|
| Gallery images now carry explicit `width`/`height` | **CLS** |
| `loading="lazy"` added to gallery thumbnails | LCP / bandwidth |
| Existing `loading="lazy"` on card images verified | LCP |
| AVIF/WebP `formats` + 30-day `minimumCacheTTL` already configured (verified, unchanged) | LCP |
| `compress: true`, `poweredByHeader: false` verified (unchanged) | TTFB / payload |
| Sitemap/JSON-LD are server-rendered, zero client JS | INP |
| `revalidate` set on dynamic pages (60s) and sitemap (3600s) | TTFB |

### What could **not** be measured

**No before/after Lighthouse or CrUX numbers are reported, because none were run.** Core Web Vitals require either PageSpeed Insights against the live domain or field data from the CrUX report in Search Console — neither was available from this environment. **No performance claim is made.**

To obtain them: run PageSpeed Insights on `https://pehchaantravels.pk` before and after deploying, and check **Search Console → Core Web Vitals** once the property is verified.

---

## 9. Build & verification log

| Check | Result |
|---|---|
| `npm run build` — compile | ✅ `✓ Compiled successfully in 33.6s` |
| `npm run build` — lint & type check | ✅ Passed (no errors) |
| `npm run build` — static generation | ⛔ **Aborts at page 18/74** with Prisma `P2010 — Server selection timeout` against `ac-un9rtma-shard-00x.ojrl4q5.mongodb.net` (`received fatal alert: InternalError`) |
| `GET /robots.txt` | ✅ 200 — correct rules, `Host:` and `Sitemap:` lines present |
| `GET /sitemap.xml` | ✅ 200 — correct `urlset`, absolute `https://pehchaantravels.pk/...` locs |
| Static pages (`/faqs`, `/about`, `/contact`, `/privacy`, `/terms`, `/make-my-trip`) | ✅ 200 with correct title, description, canonical, OG, JSON-LD |
| JSON-LD parse validation | ✅ 0 invalid blocks across all rendered pages |
| Title length audit | ✅ 0 titles over 60 characters |
| H1 audit | ✅ Exactly one `<h1>` per indexable page |
| DB-backed page rendering | ⛔ Blocked — Atlas unreachable from this machine |

> **The build failure is environmental, not caused by these changes.** The production MongoDB Atlas cluster cannot be reached from this machine (TLS `InternalError` on all three replica-set hosts). The same failure occurs on the untouched baseline. Compilation, linting and type-checking all complete before the DB fetch.

---

## 10. Google Search Console & Analytics

### Current state — stated precisely

- **GSC: NOT verified.** No verification token exists in the environment. The plumbing is ready: `app/layout.jsx` emits `<meta name="google-site-verification">` **only when** `NEXT_PUBLIC_GSC_VERIFICATION` is set. It is currently unset, so no verification tag is being served.
- **GA4: NOT active.** `components/seo/Analytics.jsx` loads nothing until `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set. No measurement ID has been provided, so **no analytics data is being collected**.
- **Sitemap: NOT submitted.** It renders correctly at `/sitemap.xml` but has not been submitted to any Search Console property.

### Conversion events implemented (dormant until GA4 ID is set)

| Event | Fired from | GA4 name |
|---|---|---|
| Tour inquiry / contact form | `ContactForm` | `generate_lead` |
| Custom trip request | `MakeMyTripForm` | `generate_lead` |
| WhatsApp click | floating `WhatsAppButton` | `whatsapp_click` |
| Add to cart | `CartContext` | `add_to_cart` |
| Begin checkout | `checkout` page | `begin_checkout` |
| Completed booking | `checkout` page | `purchase` |
| Account creation | `SignUpForm` | `sign_up` |
| Newsletter subscribe | `Footer` | `newsletter_subscribe` |

All are safe no-ops when GA4 is unconfigured, and standard GA4 recommended event names are used so no custom event configuration is required in the GA4 interface. IP anonymisation is on.

### Setup steps (yours to perform)

1. Search Console → **Add property** → domain `pehchaantravels.pk` → DNS verification (or HTML-tag method).
2. Copy the token into `NEXT_PUBLIC_GSC_VERIFICATION` in Vercel → Environment Variables → redeploy.
3. **Submit sitemap:** Search Console → Sitemaps → `https://pehchaantravels.pk/sitemap.xml`.
4. GA4 → create property → copy `G-XXXXXXXXXX` into `NEXT_PUBLIC_GA_MEASUREMENT_ID` → redeploy → verify with GA4 DebugView.
5. In GA4, mark `generate_lead` and `purchase` as key events.
6. Request indexing for `/`, `/tours`, `/places`, `/hotels`, `/faqs`.

---

## 11. Prioritized 30-day action plan

### Week 1 — Foundation (highest impact, lowest effort)
1. Deploy the current code to production.
2. Verify the domain in Search Console; set `NEXT_PUBLIC_GSC_VERIFICATION`.
3. Submit `/sitemap.xml`; confirm `robots.txt` returns 200 on the live domain.
4. **URL Inspection** → request indexing for `/`, `/tours`, `/places`, `/hotels`, `/faqs`, `/about`, `/contact`.
5. GA4 property + `NEXT_PUBLIC_GA_MEASUREMENT_ID`; mark `generate_lead` / `purchase` as key events.

### Week 2 — Fix what Search Console reports
6. Read **Coverage / Pages** report; resolve any "Crawled – currently not indexed" on tour pages.
7. Run **URL Inspection** on 3 live tour URLs; confirm canonical = self and no duplication.
8. Validate structured data with the [Rich Results Test](https://search.google.com/test/rich-results) and Schema.org validator on a tour page, a place page and `/faqs`.
9. Confirm Core Web Vitals baseline in **Search Console → Core Web Vitals**.
10. **Resolve the two conflicting office addresses** and add the confirmed `PostalAddress` to `BUSINESS` in `lib/seo.js`.

### Week 3 — Content depth (the actual ranking lever)
11. Author substantive `longDescription` copy for the five priority categories: Hunza, Skardu, Swat/Kalam, Kashmir, Kumrat (700–1,200 words each, genuinely unique).
12. Write `fullDescription` for every published destination.
13. Add 4–6 real FAQs to each top-10 tour (they flow automatically into `FAQPage` markup).
14. Confirm every published tour has a `duration`, `price`, `itinerary` and at least 5 images with good alt text.
15. Unpublish any thin/empty category so it leaves the sitemap.

### Week 4 — Authority & measurement
16. Create/complete the **Google Business Profile** (Lahore) and make name/address/phone identical to the site.
17. Publish 2 genuinely useful guides from §7 (start with *Lahore to Northern Areas tours* and a *family packages* page).
18. Earn 3–5 real citations (Pakistani travel directories) with identical NAP.
19. Review GA4: which landing pages get impressions but no clicks → rewrite those titles/descriptions.
20. Re-audit: Coverage errors = 0, CWV "good" on all money pages, `purchase` events firing.

---

## 12. Tasks requiring manual access, approval or external accounts

| # | Task | Why it needs you |
|---|---|---|
| 1 | **Google Search Console verification** | Needs your Google account + DNS/HTML token |
| 2 | **Sitemap submission in GSC** | Only possible from your GSC property |
| 3 | **GA4 property + measurement ID** | Needs your Google Analytics account |
| 4 | **Deploy to production** | Requires your Vercel/ GitHub deployment authority |
| 5 | **Confirm the real office address** | Site shows two conflicting addresses; I will not guess. Once confirmed, add it to `BUSINESS` in `lib/seo.js` |
| 6 | **Google Business Profile** creation/optimisation | Requires the business owner's Google account |
| 7 | **Keyword volume / difficulty data** | Requires Google Keyword Planner or live GSC data — no numbers were invented |
| 8 | **Core Web Vitals before/after** | Requires PageSpeed Insights on the live domain / CrUX field data |
| 9 | **Image file naming in Cloudinary** | Filenames are set by your admin upload flow, not by code |
| 10 | **Database content authoring** | Category and destination copy lives in MongoDB, edited via `/admin` |
| 11 | **NAP consistency across external listings** | Third-party directory accounts |
| 12 | **Real customer reviews** | Only genuine approved reviews can produce `AggregateRating` — none were fabricated |
| 13 | **Confirm social profile URLs** | `sameAs` is built from whatever the admin panel currently stores — verify they are correct and claimed |

---

## 13. Summary: fixed vs pending

### ✅ Fixed and implemented in code
`robots.txt` · XML sitemap · canonical URLs · unique titles/descriptions/OG/Twitter for every public page · `metadataBase` · structured data (`TravelAgency`, `BreadcrumbList`, `TouristTrip`+`Offer`, `FAQPage`, conditional `AggregateRating`) · duplicate-schema defects (2 found, 2 fixed) · duplicate-breadcrumb defects (4 found, 4 fixed) · duplicate brand in titles · `noindex` on account/cart/checkout · DB-id → slug canonical redirects · `/faq` → `/faqs` redirect · double-wrapped 404 · descriptive image alt text · gallery `width`/`height` + lazy loading · footer/internal linking · NAP consistency · GA4 loader + 8 conversion events · GSC verification hook.

### ⏳ Pending — needs your action
Production deployment · GSC verification + sitemap submission · GA4 measurement ID · office-address confirmation · Google Business Profile · DB-authored category/destination copy · real reviews · keyword volume research · CWV measurement · Cloudinary image renaming · recommended new content pages.

---

*No ranking, traffic or timeframe guarantee is made or implied. All fixes follow current Google Search Central guidance and white-hat practice; no artificial link schemes, cloaking, doorway pages or fabricated reviews/ratings were used.*
