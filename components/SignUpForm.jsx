'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SuccessMessage, ErrorBanner } from '@/components/UI'
import { fetchJson } from '@/lib/fetchJson'

export default function SignUpForm() {
  const router = useRouter()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    terms: false,
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (!form.terms) {
      setError('Please accept the Terms & Conditions.')
      return
    }

    setSubmitting(true)
    try {
      await fetchJson('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      })

      setSuccess(true)
      setTimeout(() => router.push('/'), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-card">
      <h1>Create Your Account</h1>
      <p className="auth-card__subtitle">Join Pehchaan Travels for your next adventure.</p>

      {success && <SuccessMessage message="Account created successfully! Redirecting to home..." />}
      {error && <ErrorBanner message={error} />}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input id="fullName" name="fullName" type="text" required value={form.fullName} onChange={handleChange} placeholder="Enter your full name" />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder="you@example.com" />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input id="phone" name="phone" type="tel" required value={form.phone} onChange={handleChange} placeholder="Enter your phone number" />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required minLength={6} value={form.password} onChange={handleChange} placeholder="Enter your password" />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input id="confirmPassword" name="confirmPassword" type="password" required value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter password" />
        </div>
        <label className="checkbox-label">
          <input name="terms" type="checkbox" checked={form.terms} onChange={handleChange} />
          I agree to the Terms &amp; Conditions
        </label>
        <button type="submit" className="btn btn--primary btn--full" disabled={submitting}>
          {submitting ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <p className="auth-card__footer">
        Already have an account? <Link href="/sign-in">Sign In</Link>
      </p>
    </div>
  )
}
