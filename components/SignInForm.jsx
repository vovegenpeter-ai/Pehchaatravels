'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SuccessMessage, ErrorBanner } from '@/components/UI'
import { fetchJson } from '@/lib/fetchJson'

export default function SignInForm() {
  const router = useRouter()
  const [form, setForm] = useState({ emailOrPhone: '', password: '', remember: false })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await fetchJson('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailOrPhone: form.emailOrPhone,
          password: form.password,
        }),
      })

      setSuccess(true)
      window.dispatchEvent(new Event('user-profile-updated'))
      setTimeout(() => router.push('/'), 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-card">
      <h1>Welcome Back</h1>
      <p className="auth-card__subtitle">Sign in to continue your adventure.</p>

      {success && <SuccessMessage message="Signed in successfully! Redirecting..." />}
      {error && <ErrorBanner message={error} />}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group form-group--icon">
          <label htmlFor="emailOrPhone">Email or Phone</label>
          <div className="form-input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            <input id="emailOrPhone" name="emailOrPhone" type="text" required value={form.emailOrPhone} onChange={handleChange} placeholder="Enter your email or phone" />
          </div>
        </div>
        <div className="form-group form-group--icon">
          <label htmlFor="password">Password</label>
          <div className="form-input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            <input id="password" name="password" type={showPassword ? 'text' : 'password'} required value={form.password} onChange={handleChange} placeholder="Enter your password" />
            <button type="button" className="form-input-icon__toggle" onClick={() => setShowPassword(!showPassword)} tabIndex={-1} aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              )}
            </button>
          </div>
        </div>
        <div className="auth-form__row">
          <label className="checkbox-label">
            <input name="remember" type="checkbox" checked={form.remember} onChange={handleChange} />
            Remember Me
          </label>
          <Link href="/forgot-password" className="auth-form__forgot">Forgot Password?</Link>
        </div>
        <button type="submit" className="btn btn--primary btn--full" disabled={submitting}>
          {submitting ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <p className="auth-card__footer">
        Don&apos;t have an account? <Link href="/sign-up">Sign Up</Link>
      </p>
    </div>
  )
}
