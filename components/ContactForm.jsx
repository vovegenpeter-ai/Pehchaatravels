'use client'

import { useState } from 'react'
import { SuccessMessage, ErrorBanner } from '@/components/UI'
import { fetchJson } from '@/lib/fetchJson'
import { trackEvent, EVENTS } from '@/lib/analytics'

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await fetchJson('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setSubmitted(true)
      // GA4 conversion — contact form submission (no-op until GA4 is configured)
      trackEvent(EVENTS.contactSubmit, { form_location: 'contact_page', method: 'contact_form' })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return <SuccessMessage message="Thank you! Your message has been sent. We'll get back to you soon." />
  }

  return (
    <>
      {error && <ErrorBanner message={error} />}
      {/* data-ph-block: session replay never captures this lead form's subtree. */}
      <form onSubmit={handleSubmit} className="contact-form" data-ph-block>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input id="name" name="name" required value={form.name} onChange={handleChange} />
        </div>
        <div className="form-row-2">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="subject">Subject</label>
          <input id="subject" name="subject" required value={form.subject} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea id="message" name="message" rows={5} required value={form.message} onChange={handleChange} />
        </div>
        <button type="submit" className="btn btn--primary btn--lg" disabled={submitting}>
          {submitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </>
  )
}
