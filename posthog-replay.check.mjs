/**
 * Offline checks for the consent-gated PostHog session replay integration.
 *
 * Run with:  node --test posthog-replay.check.mjs
 *
 * This file imports the real controller that instrumentation-client.ts mounts
 * (lib/posthog-replay.mjs) and drives it with SDK / router / consent stubs.
 * The environment object starts empty and only synthetic values are added;
 * no dotenv or framework loader runs and network access is denied.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

import {
  ALLOWED_HOSTS,
  HOST_ENV_KEY,
  TOKEN_ENV_KEY,
  buildInitOptions,
  createReplayController,
  isSensitivePath,
  redactCapturedUrl,
  resolveConfig,
} from './lib/posthog-replay.mjs'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))
const SYNTHETIC_TOKEN = 'synthetic-project-token'
const SAFE_HOST = ALLOWED_HOSTS.includes('https://eu.i.posthog.com')
  ? 'https://eu.i.posthog.com'
  : ALLOWED_HOSTS[0]
const ORIGIN = 'https://pehchaantravels.pk'

// ── Network denied for the whole run ────────────────────────────────────────
const realFetch = globalThis.fetch
globalThis.fetch = () => {
  throw new Error('network access is denied in posthog-replay.check.mjs')
}
test.after(() => {
  globalThis.fetch = realFetch
})

/** Synthetic config only: the env object starts empty every time. */
function syntheticEnv(overrides = {}) {
  return {
    [TOKEN_ENV_KEY]: SYNTHETIC_TOKEN,
    [HOST_ENV_KEY]: SAFE_HOST,
    ...overrides,
  }
}

function createSdkStub({ fail = {} } = {}) {
  const events = []
  const calls = { init: [], optIn: 0, optOut: 0, start: [], stop: 0 }
  const sdk = {
    __loaded: false,
    init(token, options) {
      if (fail.init) throw new Error('sdk init failed')
      events.push('init')
      calls.init.push({ token, options })
      sdk.__loaded = true
    },
    opt_in_capturing() {
      if (fail.optIn) throw new Error('opt in failed')
      events.push('optIn')
      calls.optIn += 1
    },
    opt_out_capturing() {
      if (fail.optOut) throw new Error('opt out failed')
      events.push('optOut')
      calls.optOut += 1
    },
    startSessionRecording(...args) {
      if (fail.start) throw new Error('start failed')
      events.push('start')
      calls.start.push(args)
    },
    stopSessionRecording() {
      if (fail.stop) throw new Error('stop failed')
      events.push('stop')
      calls.stop += 1
    },
  }
  return { sdk, calls, events }
}

function createConsentStub(initial = 'unknown') {
  let state = initial
  const listeners = new Set()
  return {
    read: () => state,
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    set(next) {
      state = next
      for (const listener of [...listeners]) listener(next)
    },
    listenerCount: () => listeners.size,
  }
}

function createRouterStub() {
  const listeners = new Set()
  return {
    onRouteChange(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    navigate(url) {
      for (const listener of [...listeners]) listener(url)
    },
    listenerCount: () => listeners.size,
  }
}

function mountController({ env = syntheticEnv(), consent = createConsentStub(), router = createRouterStub(), posthog = createSdkStub().sdk, pathname = '/tours' } = {}) {
  const controller = createReplayController({
    posthog,
    env,
    consent,
    router,
    location: { pathname, origin: ORIGIN },
  })
  controller.mount()
  return { controller, consent, router, posthog }
}

// ── Missing configuration is a complete no-op ───────────────────────────────
test('missing token or host means no init and no listeners', () => {
  const cases = [
    {},
    syntheticEnv({ [HOST_ENV_KEY]: undefined }),
    syntheticEnv({ [TOKEN_ENV_KEY]: undefined }),
    syntheticEnv({ [TOKEN_ENV_KEY]: '  ' }),
    // A personal API key must never be used as a browser token.
    syntheticEnv({ [TOKEN_ENV_KEY]: 'phx_personal' }),
    // No host fallback: only the documented US/EU hosts are accepted.
    syntheticEnv({ [HOST_ENV_KEY]: 'https://posthog.example.com' }),
  ]

  assert.equal(resolveConfig({}), null)

  for (const env of cases) {
    const { sdk, calls } = createSdkStub()
    const consent = createConsentStub('granted')
    const router = createRouterStub()
    const controller = createReplayController({
      posthog: sdk,
      env,
      consent,
      router,
      location: { pathname: '/tours', origin: ORIGIN },
    })
    controller.mount()

    assert.equal(calls.init.length, 0)
    assert.equal(calls.start.length, 0)
    assert.equal(consent.listenerCount(), 0)
    assert.equal(router.listenerCount(), 0)
    assert.equal(controller.getState().configured, false)
    assert.equal(controller.start(), false)
  }
})

test('unknown and denied consent never initialise or record', () => {
  for (const state of ['unknown', 'denied', 'something-else']) {
    const { sdk, calls } = createSdkStub()
    const consent = createConsentStub(state)
    const router = createRouterStub()
    const controller = createReplayController({
      posthog: sdk,
      env: syntheticEnv(),
      consent,
      router,
      location: { pathname: '/tours', origin: ORIGIN },
    })
    controller.mount()

    assert.equal(calls.init.length, 0, `no init for consent "${state}"`)
    assert.equal(calls.start.length, 0, `no recording for consent "${state}"`)
    assert.equal(controller.getState().recording, false)
  }
})

// ── Affirmative consent ─────────────────────────────────────────────────────
test('a granted safe journey starts replay once, opt-in first', () => {
  const consent = createConsentStub('granted')
  const router = createRouterStub()
  const { sdk, calls, events } = createSdkStub()
  const { controller } = mountController({ consent, router, posthog: sdk })

  const state = controller.getState()
  assert.equal(state.configured, true)
  assert.equal(state.recording, true)
  assert.equal(router.listenerCount(), 1)
  assert.equal(consent.listenerCount(), 1)
  assert.equal(calls.init.length, 1)
  assert.equal(calls.optIn, 1)
  assert.equal(calls.start.length, 1)
  assert.deepEqual(events, ['init', 'optIn', 'start'])

  // Repeated grants and safe route changes must not start a second recording.
  controller.applyConsent('granted')
  controller.handleRouteChange('/tours/hunza-valley-tour')
  assert.equal(calls.start.length, 1)
  assert.equal(calls.optIn, 1)
})

test('replay start never overrides project controls', () => {
  const consent = createConsentStub('granted')
  const { sdk, calls, events } = createSdkStub()
  const { controller } = mountController({ consent, posthog: sdk })

  assert.equal(calls.start.length, 1)
  // Plain startSessionRecording(): no `true`, no override object.
  assert.deepEqual(calls.start[0], [])
  assert.deepEqual(events, ['init', 'optIn', 'start'])
  assert.equal(controller.getState().recording, true)
})

test('new clients start opted out; an existing singleton is reused without a second init', () => {
  const consent = createConsentStub('granted')
  const { sdk, calls } = createSdkStub()
  mountController({ consent, posthog: sdk })

  const options = calls.init[0].options
  assert.equal(options.opt_out_capturing_by_default, true)
  assert.equal(options.disable_session_recording, true)

  // Second controller over the same already-loaded browser singleton.
  const second = mountController({ consent, posthog: sdk })
  assert.equal(calls.init.length, 1, 'no second init')
  assert.equal(second.controller.getState().recording, true)
})

test('remounts add no duplicate init, start or listeners', () => {
  const consent = createConsentStub('granted')
  const router = createRouterStub()
  const { sdk, calls } = createSdkStub()
  const controller = createReplayController({
    posthog: sdk,
    env: syntheticEnv(),
    consent,
    router,
    location: { pathname: '/', origin: ORIGIN },
  })

  controller.mount()
  controller.mount()
  controller.mount()

  assert.equal(calls.init.length, 1)
  assert.equal(calls.start.length, 1)
  assert.equal(router.listenerCount(), 1)
  assert.equal(consent.listenerCount(), 1)

  controller.dispose()
  assert.equal(router.listenerCount(), 0)
  assert.equal(consent.listenerCount(), 0)
  assert.equal(controller.getState().recording, false)

  controller.mount()
  assert.equal(calls.init.length, 1, 'remount keeps the single client')
  assert.equal(router.listenerCount(), 1)
  assert.equal(consent.listenerCount(), 1)
})

// ── Stopping rules ──────────────────────────────────────────────────────────
test('exit, sensitive routes and revocation stop; withdrawal opts out', () => {
  const consent = createConsentStub('granted')
  const { controller, router } = mountController({ consent, pathname: '/tours' })
  assert.equal(controller.getState().recording, true)

  controller.exit()
  assert.equal(controller.getState().recording, false)

  controller.applyConsent('granted')
  assert.equal(controller.getState().recording, true)

  for (const sensitive of [
    '/checkout?phone=03001234567',
    '/cart',
    '/bookings',
    '/profile',
    '/sign-in',
    '/reset-password/abc123',
    '/admin/tours',
    '/contact',
    '/make-my-trip',
    '/api/orders',
  ]) {
    assert.equal(isSensitivePath(sensitive), true, `${sensitive} must be blocked`)
    router.navigate(sensitive)
    assert.equal(
      controller.getState().recording,
      false,
      `${sensitive} must stop recording`,
    )
  }

  // Leaving the sensitive route after consent resumes on a safe route.
  router.navigate('/places/skardu')
  assert.equal(controller.getState().recording, true)

  // Revocation stops recording.
  consent.set('denied')
  assert.equal(controller.getState().recording, false)
  router.navigate('/tours')
  assert.equal(controller.getState().recording, false, 'denied consent stays stopped')
})

test('withdrawal opts capturing out; denied re-entry stays stopped', () => {
  const consent = createConsentStub('granted')
  const { sdk, calls } = createSdkStub()
  const first = mountController({ consent, posthog: sdk })

  consent.set('denied')
  assert.equal(calls.optOut, 1)
  assert.equal(first.controller.getState().recording, false)

  // A new controller (page reload) with the stored denial must stay stopped.
  const second = mountController({ consent, posthog: sdk })
  assert.equal(second.controller.getState().recording, false)
  assert.equal(calls.start.length, 1, 'no new recording after denial')
  assert.equal(calls.init.length, 1)
})

test('SDK failures preserve the developer actions', () => {
  for (const fail of [{ init: true }, { optIn: true }, { start: true }, { stop: true }]) {
    const consent = createConsentStub('granted')
    const { sdk, calls } = createSdkStub({ fail })
    const controller = createReplayController({
      posthog: sdk,
      env: syntheticEnv(),
      consent,
      router: createRouterStub(),
      location: { pathname: '/tours', origin: ORIGIN },
    })

    assert.doesNotThrow(() => controller.mount())
    assert.doesNotThrow(() => controller.applyConsent('granted'))
    assert.doesNotThrow(() => controller.exit())
    assert.doesNotThrow(() => controller.dispose())
    assert.equal(typeof controller.getState().recording, 'boolean')
    assert.ok(calls.start.length <= 3)
  }
})

// ── Privacy configuration ───────────────────────────────────────────────────
test('every replay channel is explicitly disabled or masked', () => {
  const consent = createConsentStub('granted')
  const { sdk, calls } = createSdkStub()
  mountController({ consent, posthog: sdk })

  assert.equal(calls.init.length, 1)
  const options = calls.init[0].options
  assert.equal(options.api_host, SAFE_HOST)

  for (const flag of [
    'opt_out_capturing_by_default',
    'disable_session_recording',
  ]) {
    assert.equal(options[flag], true, flag)
  }

  for (const flag of [
    'autocapture',
    'capture_pageview',
    'capture_pageleave',
    'capture_dead_clicks',
    'rageclick',
    'capture_exceptions',
    'capture_heatmaps',
    'capture_performance',
    'enable_recording_console_log',
  ]) {
    assert.equal(options[flag], false, flag)
  }

  const recording = options.session_recording
  assert.equal(recording.maskAllInputs, true)
  assert.equal(recording.maskTextSelector, '*')
  assert.equal(recording.blockClass, 'ph-no-capture')
  assert.match(recording.blockSelector, /\[data-ph-block\]/)
  assert.equal(recording.recordBody, false)
  assert.equal(recording.recordHeaders, false)
  assert.deepEqual(recording.captureCanvas, { recordCanvas: false })
  assert.equal(recording.captureJsonLd, false)
  assert.equal(typeof recording.maskCapturedNetworkRequestFn, 'function')
})

test('the captured-URL hook strips secrets and drops unsafe requests', () => {
  const mask = buildInitOptions({ host: SAFE_HOST, origin: ORIGIN })
    .session_recording.maskCapturedNetworkRequestFn

  const safe = [
    [
      'https://pehchaantravels.pk/tours/hunza-valley?email=a%40b.com&token=abc#reviews',
      'https://pehchaantravels.pk/tours/hunza-valley',
    ],
    ['/places/skardu?ref=newsletter#top', `${ORIGIN}/places/skardu`],
    [`${ORIGIN}/tours`, `${ORIGIN}/tours`],
  ]
  for (const [raw, expected] of safe) {
    assert.equal(redactCapturedUrl(raw, { origin: ORIGIN }), expected)
    assert.deepEqual(mask({ name: raw, method: 'GET' }), {
      name: expected,
      method: 'GET',
    })
  }

  const dropped = [
    `${ORIGIN}/checkout?card=4242`,
    `${ORIGIN}/sign-in?next=/bookings`,
    `${ORIGIN}/profile?token=abc`,
    `${ORIGIN}/bookings/order-123`,
    `${ORIGIN}/api/auth/signin`,
    'javascript:alert(1)',
    'http://%zz',
    'not a url',
    '',
    '//evil.example.com/path',
  ]
  for (const raw of dropped) {
    assert.equal(redactCapturedUrl(raw, { origin: ORIGIN }), null, raw)
    assert.equal(mask({ name: raw }), null, raw)
  }

  assert.equal(mask(null), null)
  assert.equal(mask({ name: undefined }), null)
  assert.equal(mask({}), null)
})

test('safe journey routes are not blocked', () => {
  for (const route of [
    '/',
    '/tours',
    '/tours/hunza-valley-tour',
    '/places',
    '/places/northern-pakistan',
    '/destinations/skardu',
    '/hotels/serena-shigar',
    '/faqs',
    '/about',
  ]) {
    assert.equal(isSensitivePath(route), false, route)
  }
  // Unknown input fails closed.
  assert.equal(isSensitivePath(''), true)
  assert.equal(isSensitivePath(undefined), true)
})

// ── The real entry mounts this tested code ──────────────────────────────────
test('instrumentation-client mounts the tested controller with real SDK, consent and router', () => {
  const entry = readFileSync(path.join(projectRoot, 'instrumentation-client.ts'), 'utf8')
  assert.match(entry, /from 'posthog-js'/)
  assert.match(entry, /from '\.\/lib\/posthog-replay\.mjs'/)
  assert.match(entry, /createReplayController\(/)
  assert.match(entry, /controller\.mount\(\)/)
  assert.match(entry, /NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN/)
  assert.match(entry, /NEXT_PUBLIC_POSTHOG_HOST/)
  assert.match(entry, /export function onRouterTransitionStart/)
  // Replay options live in the controller, not duplicated in the entry.
  assert.equal(entry.includes('session_recording'), false)

  const layout = readFileSync(path.join(projectRoot, 'app/layout.jsx'), 'utf8')
  assert.match(layout, /<ConditionalConsentBanner \/>/)

  const gate = readFileSync(
    path.join(projectRoot, 'components/ConditionalConsentBanner.jsx'),
    'utf8',
  )
  assert.match(gate, /<ConsentBanner \/>/)

  const banner = readFileSync(path.join(projectRoot, 'components/ConsentBanner.jsx'), 'utf8')
  assert.match(banner, /grantAnalyticsConsent/)
  assert.match(banner, /denyAnalyticsConsent/)

  const controllerSource = readFileSync(
    path.join(projectRoot, 'lib/posthog-replay.mjs'),
    'utf8',
  )
  assert.equal(/startSessionRecording\s*\(\s*(true|[{[])/.test(controllerSource), false)
  assert.match(controllerSource, /opt_out_capturing_by_default: true/)
  assert.match(controllerSource, /disable_session_recording: true/)
})

// ── Workspace resolution ────────────────────────────────────────────────────
test('the importing workspace pins and resolves posthog-js 1.438.13', () => {
  for (const otherLock of ['yarn.lock', 'pnpm-lock.yaml', 'bun.lockb', 'bun.lock']) {
    assert.equal(
      existsSync(path.join(projectRoot, otherLock)),
      false,
      `${otherLock} makes the repository ineligible`,
    )
  }
  assert.equal(existsSync(path.join(projectRoot, 'package-lock.json')), true)

  const manifest = JSON.parse(
    readFileSync(path.join(projectRoot, 'package.json'), 'utf8'),
  )
  assert.equal(manifest.dependencies['posthog-js'], '1.438.13')
  assert.equal(manifest.workspaces, undefined, 'the root package is the only importer')

  // No secondary package in the tree may declare the SDK.
  const importers = []
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git') continue
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name === 'package.json') {
        const pkg = JSON.parse(readFileSync(full, 'utf8'))
        if (pkg.dependencies?.['posthog-js'] || pkg.devDependencies?.['posthog-js']) {
          importers.push(path.relative(projectRoot, full))
        }
      }
    }
  }
  walk(projectRoot)
  assert.deepEqual(importers, ['package.json'])

  const lock = JSON.parse(
    readFileSync(path.join(projectRoot, 'package-lock.json'), 'utf8'),
  )
  assert.ok(lock.lockfileVersion >= 2)
  assert.equal(lock.packages[''].dependencies['posthog-js'], '1.438.13')

  const locked = lock.packages['node_modules/posthog-js']
  assert.ok(locked, 'lock must resolve posthog-js for this importer')
  assert.equal(locked.version, '1.438.13')
  assert.match(locked.resolved, /posthog-js-1\.438\.13\.tgz$/)

  // The installed resolution the app actually imports.
  const installed = JSON.parse(
    readFileSync(
      path.join(projectRoot, 'node_modules/posthog-js/package.json'),
      'utf8',
    ),
  )
  assert.equal(installed.version, '1.438.13')
})

test('changed sources contain no live PostHog credential literal', () => {
  const changed = [
    'instrumentation-client.ts',
    'lib/posthog-replay.mjs',
    'lib/consent.js',
    'components/ConsentBanner.jsx',
    'components/ConditionalConsentBanner.jsx',
    'app/layout.jsx',
    'posthog-replay.check.mjs',
    'POSTHOG_REPLAY.md',
  ]
  const credential = /\bph[cx]_[A-Za-z0-9]{12,}/
  for (const file of changed) {
    const full = path.join(projectRoot, file)
    if (!existsSync(full)) continue
    const source = readFileSync(full, 'utf8')
    assert.equal(credential.test(source), false, `${file} holds a PostHog token`)
    assert.equal(/https:\/\/[a-z0-9-]+\.i\.posthog\.com\/(project|api)\//.test(source), false)
  }
})
