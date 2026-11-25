'use client'

import { useEffect, useState } from 'react'
import {
  CONSENT_UNKNOWN,
  denyAnalyticsConsent,
  grantAnalyticsConsent,
  readConsent,
} from '@/lib/consent'

/**
 * Consent banner for optional analytics, advertising measurement and masked
 * session replay.
 *
 * Nothing is recorded until the visitor picks "Allow analytics"; both answers
 * are remembered locally and can be changed by clearing site data.
 */
export default function ConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(readConsent() === CONSENT_UNKNOWN)
  }, [])

  if (!visible) return null

  const choose = (grant) => {
    if (grant) grantAnalyticsConsent()
    else denyAnalyticsConsent()
    setVisible(false)
  }

  return (
    <div className="consent-banner" role="dialog" aria-label="Analytics consent">
      <p className="consent-banner__text">
        Help us improve our tour pages with optional analytics, advertising
        measurement and masked session replays. Inputs and text are hidden, and
        booking, WhatsApp and enquiry flows work exactly the same if you decline.
      </p>
      <div className="consent-banner__actions">
        <button
          type="button"
          className="btn btn--outline btn--sm"
          onClick={() => choose(false)}
        >
          Decline
        </button>
        <button
          type="button"
          className="btn btn--primary btn--sm"
          onClick={() => choose(true)}
        >
          Allow analytics
        </button>
      </div>
    </div>
  )
}
