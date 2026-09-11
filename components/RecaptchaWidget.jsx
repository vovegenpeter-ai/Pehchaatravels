'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

// Google reCAPTCHA v2 checkbox widget.
//
// Only the PUBLIC site key (NEXT_PUBLIC_RECAPTCHA_SITE_KEY) is used here.
// The secret key lives exclusively in lib/recaptcha.ts on the server.
//
// Renders nothing when the site key is not configured, so local dev
// environments without reCAPTCHA keys keep working.

let recaptchaLoaderPromise = null

// api.js exposes window.grecaptcha immediately but adds .render only after its
// gstatic payload finishes loading — poll briefly until the API is usable.
function waitForGrecaptchaApi(timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const started = Date.now()
    const tick = () => {
      const g = window.grecaptcha
      if (g && typeof g.render === 'function') {
        resolve(g)
        return
      }
      if (Date.now() - started > timeoutMs) {
        reject(new Error('grecaptcha.render did not become available'))
        return
      }
      setTimeout(tick, 100)
    }
    tick()
  })
}

function loadRecaptchaScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'))
  if (window.grecaptcha?.render) return Promise.resolve(window.grecaptcha)
  if (recaptchaLoaderPromise) return recaptchaLoaderPromise

  recaptchaLoaderPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit'
    script.async = true
    script.defer = true
    script.onload = () => {
      waitForGrecaptchaApi()
        .then(resolve)
        .catch((err) => {
          recaptchaLoaderPromise = null
          reject(err)
        })
    }
    script.onerror = () => {
      recaptchaLoaderPromise = null
      reject(new Error('Failed to load reCAPTCHA script'))
    }
    document.head.appendChild(script)
  })
  return recaptchaLoaderPromise
}

export default function RecaptchaWidget({ onChange, resetSignal = 0 }) {
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)
  const [scriptFailed, setScriptFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)

  const notify = useCallback(
    (token) => {
      if (typeof onChange === 'function') onChange(token || '')
    },
    [onChange],
  )

  useEffect(() => {
    let cancelled = false

    loadRecaptchaScript()
      .then((grecaptcha) => {
        if (cancelled || !containerRef.current || widgetIdRef.current !== null) return
        widgetIdRef.current = grecaptcha.render(containerRef.current, {
          sitekey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
          callback: (token) => notify(token),
          'expired-callback': () => notify(''),
          'error-callback': () => notify(''),
        })
      })
      .catch(() => {
        if (!cancelled) setScriptFailed(true)
      })

    return () => {
      cancelled = true
    }
  }, [attempt, notify])

  // Tokens are single-use: parents bump resetSignal after a failed request so
  // the user has to solve the captcha again.
  const prevResetRef = useRef(resetSignal)
  useEffect(() => {
    if (resetSignal === prevResetRef.current) return
    prevResetRef.current = resetSignal
    if (window.grecaptcha && widgetIdRef.current !== null) {
      window.grecaptcha.reset(widgetIdRef.current)
      notify('')
    }
  }, [resetSignal, notify])

  if (!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
    return null
  }

  if (scriptFailed) {
    return (
      <p className="recaptcha-error" role="alert">
        Could not load the captcha.{' '}
        <button
          type="button"
          className="recaptcha-retry"
          onClick={() => {
            setScriptFailed(false)
            setAttempt((n) => n + 1)
          }}
        >
          Retry
        </button>{' '}
        or refresh the page.
      </p>
    )
  }

  return <div className="recaptcha-widget" ref={containerRef} />
}
