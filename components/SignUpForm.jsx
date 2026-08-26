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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
      setError('Please accept the Terms of Service.')
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
      window.dispatchEvent(new Event('user-profile-updated'))
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
        <div className="form-group form-group--icon">
          <label htmlFor="password">Password</label>
          <div className="form-input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            <input id="password" name="password" type={showPassword ? 'text' : 'password'} required minLength={6} value={form.password} onChange={handleChange} placeholder="Enter your password" />
            <button type="button" className="form-input-icon__toggle" onClick={() => setShowPassword(!showPassword)} tabIndex={-1} aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              )}
            </button>
          </div>
        </div>
        <div className="form-group form-group--icon">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="form-input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter password" />
            <button type="button" className="form-input-icon__toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex={-1} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
              {showConfirmPassword ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              )}
            </button>
          </div>
        </div>
        <label className="checkbox-label">
          <input name="terms" type="checkbox" checked={form.terms} onChange={handleChange} />
          I agree to the <Link href="/terms" target="_blank">Terms of Service</Link>
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
