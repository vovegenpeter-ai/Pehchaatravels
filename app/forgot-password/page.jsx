'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { fetchJson } from '@/lib/fetchJson'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const data = await fetchJson('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setSuccess((data.message || 'If an account with that email exists, a reset link has been sent.') + ' Redirecting to sign in...')
      setTimeout(() => {
        router.push('/sign-in')
      }, 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-section">
      <div className="container">
        <div className="auth-card">
          <h1>Forgot Password</h1>
          <p className="auth-card__subtitle">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
          {error && <div className="error-banner">{error}</div>}
          {success && <div className="success-banner">{success}</div>}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || Boolean(success)}
              />
            </div>
            <button type="submit" className="btn btn--primary btn--full" disabled={loading || Boolean(success)}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
          <p className="auth-card__footer">
            Remember your password? <Link href="/sign-in">Sign In</Link>
          </p>
        </div>
      </div>
    </section>
  )
}
