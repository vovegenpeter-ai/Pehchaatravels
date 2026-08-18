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
      setTimeout(() => router.push('/'), 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-card">
      <h1>Sign In</h1>
      <p className="auth-card__subtitle">Welcome back! Sign in to continue your journey</p>

      {success && <SuccessMessage message="Signed in successfully! Redirecting..." />}
      {error && <ErrorBanner message={error} />}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="emailOrPhone">Email or Phone</label>
          <input id="emailOrPhone" name="emailOrPhone" type="text" required value={form.emailOrPhone} onChange={handleChange} placeholder="Email or phone number" />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required value={form.password} onChange={handleChange} placeholder="Enter your password" />
        </div>
        <div className="form-row">
          <label className="checkbox-label">
            <input name="remember" type="checkbox" checked={form.remember} onChange={handleChange} />
            Remember Me
          </label>
          <Link href="/forgot-password" className="form-link">Forgot Password?</Link>
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
