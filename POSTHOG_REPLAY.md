# PostHog session replay — consent-controlled browser journey

Status: implemented and checked locally. **Nothing is committed and no PostHog
project, deployment or remote setting was touched.** Until the two public
environment variables below are set, the whole integration is a no-op.

## Repository facts recorded before editing

| Item | Value |
| --- | --- |
| Framework | Next.js 15.5.23, App Router, React 19, JavaScript (`.jsx` + a few `.ts` modules) |
| Package manager | npm (no `packageManager` field; `package-lock.json` lockfileVersion 3) |
| Lockfiles present | `package-lock.json` only — no `yarn.lock`, `pnpm-lock.yaml`, `bun.lock(b)` |
| Monorepo? | No. Single app at the repository root; the SDK-importing package is the root `pehchaan-travels` |
| SDK before this change | none (only a GA4 `gtag` helper in `lib/analytics.js` and `components/seo/Analytics.jsx`) |
| Consent source before this change | none |

### Baseline checks (run before any edit)

| Check | Result |
| --- | --- |
| Typecheck — no `typecheck` script exists, so `npx tsc --noEmit` | **pass** (exit 0) |
| Lint — `npm run lint` (`next lint`) | **fail, pre-existing** — `next lint` is deprecated in Next 15/16 and no ESLint config was committed, so it drops into the "How would you like to configure ESLint?" prompt and exits 1. Left exactly as found, not "fixed", not suppressed. |
| Tests | no test script exists in this project |

This baseline failure is unrelated to the replay integration and is unchanged.
The offline checks below are the project's evidence for the new code.

## Install and resolution

```
npm install posthog-js@1.438.13
```

- `package.json` → `dependencies["posthog-js"] = "1.438.13"` (exact).
- `package-lock.json` → root importer depends on `posthog-js@1.438.13` and
  `node_modules/posthog-js` resolves to `1.438.13`
  (`https://registry.npmjs.org/posthog-js/-/posthog-js-1.438.13.tgz`).
- `node_modules/posthog-js/package.json` → `1.438.13` (the copy the app imports).
- The SDK is resolved from the root app package — the only package in the repo.

## How it is mounted

- **[instrumentation-client.ts](instrumentation-client.ts)** — Next.js ≥ 15.3
  browser bootstrap. It imports the real `posthog-js` singleton, the consent
  store and the replay controller, and mounts the controller once inside
  `typeof window !== 'undefined'`. Next's `onRouterTransitionStart` export
  forwards client-side navigations to the controller. `pagehide` calls `exit()`.
  This file contains no replay options of its own.
- **[lib/posthog-replay.mjs](lib/posthog-replay.mjs)** — the controller. Plain
  ESM with no SDK, framework or DOM imports, so Node imports this exact file in
  the offline checks. It owns the SDK config, consent handling, route blocking
  and URL redaction. `createReplayController({ posthog, env, consent, router, location })`
  takes every dependency by injection.
- **[lib/consent.js](lib/consent.js)** — consent store (browser only). Stored
  value `pehchaan_analytics_consent` is `granted` or `denied`; anything else,
  including blocked storage, reads as `unknown`. Explicit grant and deny/withdraw
  helpers, plus a subscribe hook that cleans up its `storage` listener.
- **[components/ConsentBanner.jsx](components/ConsentBanner.jsx)** and
  **[components/ConditionalConsentBanner.jsx](components/ConditionalConsentBanner.jsx)**
  — the affirmative choice UI, rendered from [app/layout.jsx](app/layout.jsx)
  outside the admin dashboard. Styled in `app/globals.css` (`.consent-banner`).

Consent flow: `unknown` → nothing initialised and nothing recorded. `Allow
analytics` → `opt_in_capturing()` then plain `startSessionRecording()` (no
`true`, no override object), so project enablement, sampling, triggers, minimum
duration and authorised domains still decide whether anything is captured.
`Decline` / withdrawal → `stopSessionRecording()` **and** `opt_out_capturing()`.
A denied visitor who reloads stays stopped.

## Privacy boundaries

Fresh-client init options (set locally, so they override remote defaults):

| Channel | Setting |
| --- | --- |
| Capture on load | `opt_out_capturing_by_default: true`, `disable_session_recording: true` |
| Autocapture / pageviews / pageleave / dead clicks / rageclick / exceptions / heatmaps | all `false` |
| Console logs | `enable_recording_console_log: false` (top level) |
| Performance capture | `capture_performance: false` (top level) |
| Inputs | `session_recording.maskAllInputs: true` |
| Text | `session_recording.maskTextSelector: "*"` |
| Blocked subtrees | `blockClass: "ph-no-capture"`, `blockSelector: "[data-ph-block]"` |
| Network bodies / headers | `recordBody: false`, `recordHeaders: false` |
| Canvas | `captureCanvas: { recordCanvas: false }` |
| JSON-LD | `captureJsonLd: false` |
| Captured URLs | `session_recording.maskCapturedNetworkRequestFn` — rebuilds every request name as `origin + pathname` (query string and fragment removed) and returns `null` to drop unparseable URLs, non-http(s) schemes, protocol-relative URLs and every blocked route |

Sensitive routes (never recorded, and recording stops on arrival — this list is
`SENSITIVE_PATH_SEGMENTS` in the controller): `admin`, `api`, `auth`, `login`,
`logout`, `sign-in`, `sign-up`, `forgot-password`, `reset-password`, `profile`,
`account`, `payment(s)`, `checkout`, `cart`, `order(s)`, `bookings`,
`make-my-trip`, `contact`, plus any segment containing
`password/token/secret/api-key/session/otp/reset`.

Blocks are subtree-level, not text-level: `data-ph-block` is on the contact and
make-my-trip lead forms, and `ph-no-capture` remains the opt-out class for any
future element. No names, emails, phone numbers, form values, credentials or
free text are sent as event properties — nothing in this change sends events.

## Safe journey and what to expect in a recording

Safe: `/` → `/tours` → `/tours/<slug>` → `/places` → `/places/<category>` →
`/destinations/<slug>` → `/hotels/<slug>` → `/faqs` → `/about`.

Excluded: `/checkout`, `/cart`, `/bookings`, `/profile`, `/sign-in`,
`/sign-up`, `/forgot-password`, `/reset-password/*`, `/contact`,
`/make-my-trip`, `/admin/*`, `/api/*`.

## Offline checks

```
node --test posthog-replay.check.mjs
```

[posthog-replay.check.mjs](posthog-replay.check.mjs) imports
`lib/posthog-replay.mjs` directly and drives it with SDK/router/consent stubs
and synthetic config (`env` starts `{}`; no dotenv, no framework autoload;
`fetch` is replaced with a throwing stub for the run). It covers: missing
token/host → no init and no listeners; personal API keys (`phx_`) and unknown
hosts rejected; unknown/denied consent never initialises or records; a granted
safe journey initialises once and calls `opt_in_capturing()` then
`startSessionRecording()` with no arguments; remounts add no duplicate
init/start/listeners and `dispose()` removes them; exit, sensitive routes and
revocation stop; withdrawal opts out and denied re-entry stays stopped; SDK
failures never throw through; merged privacy options for every channel; the real
`maskCapturedNetworkRequestFn` receiving query/fragment secrets, malformed URLs
and blocked paths; the workspace manifest + lock pinning `posthog-js@1.438.13`
with no secondary lockfile; the entry/layout/banner wiring; and no live PostHog
credential literal in the changed sources.

## Configure privately (not done by this change)

1. Create or sign in to a PostHog account: https://app.posthog.com/signup
   (the offer link) and choose either the **US** (`https://us.i.posthog.com`)
   or **EU** (`https://eu.i.posthog.com`) region — there is no fallback.
2. In the project, copy the **public project token** (Project settings → Project
   token, starts with `phc_`; never a personal API key) and put both values in
   `.env.local` (git-ignored, not readable by this run):
   ```
   NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=
   NEXT_PUBLIC_POSTHOG_HOST=
   ```
   `.env.example` already lists both names with empty values.
3. In PostHog project settings, review session recording enablement, sampling,
   triggers (optionally restrict to the safe paths above), minimum duration and
   authorised domains. Recording only starts after a visitor grants consent, so
   any trigger/sampling/domain rule still applies on top.
4. Restart the app (`npm run dev`), click **Allow analytics**, then browse the
   safe journey. Open the recording in PostHog and confirm: useful context
   (pages, clicks, journey), masked inputs and text, no `/checkout`,
   `/sign-in`, `/profile`, `/bookings`, `/contact` or `/api` content, no query
   strings or fragments in captured URLs, and no personal data.
5. Check that **Decline** (and withdrawing consent) stops capture: no new
   recording starts on the next visit, and no further snapshots are added to
   the current one.

This step is the only part not confirmed here: it needs a real PostHog account
and private credentials.
