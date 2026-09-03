'use client'

import { useState } from 'react'
import { SuccessMessage, ErrorBanner } from '@/components/UI'
import { fetchJson } from '@/lib/fetchJson'

export default function MakeMyTripForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    destination: '',
    travelers: '',
    startDate: '',
    endDate: '',
    budget: '',
    message: '',
  })
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
      await fetchJson('/api/trip-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <SuccessMessage message="Your trip request has been submitted! Our team will contact you within 24 hours." />
    )
  }

  return (
    <>
      {error && <ErrorBanner message={error} />}
      <form onSubmit={handleSubmit} className="trip-form">
        <div className="form-row-2">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input id="name" name="name" required value={form.name} onChange={handleChange} placeholder="Enter your full name" />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder="Enter your email address" />
          </div>
        </div>
        <div className="form-row-2">
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input id="phone" name="phone" type="tel" required value={form.phone} onChange={handleChange} placeholder="Enter your phone number" />
          </div>
          <div className="form-group">
            <label htmlFor="destination">Preferred Destination</label>
            <input id="destination" name="destination" required value={form.destination} onChange={handleChange} placeholder="e.g. Hunza, Skardu" />
          </div>
        </div>
        <div className="form-row-2">
          <div className="form-group">
            <label htmlFor="travelers">Number of Travelers</label>
            <input id="travelers" name="travelers" type="number" min="1" required value={form.travelers} onChange={handleChange} placeholder="Enter number of travelers" />
          </div>
          <div className="form-group">
            <label htmlFor="budget">Your Departure City</label>
            <input id="budget" name="budget" value={form.budget} onChange={handleChange} placeholder="e.g. Lahore, Islamabad" />
          </div>
        </div>
        <div className="form-row-2">
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input id="startDate" name="startDate" type="date" required value={form.startDate} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input id="endDate" name="endDate" type="date" required value={form.endDate} onChange={handleChange} />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="message">Additional Details</label>
          <textarea id="message" name="message" rows={5} value={form.message} onChange={handleChange} placeholder="Tell us about your preferences, interests, and special requirements..." />
        </div>
        <button type="submit" className="btn btn--primary btn--lg" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Send Inquiry'}
        </button>
      </form>
    </>
  )
}
