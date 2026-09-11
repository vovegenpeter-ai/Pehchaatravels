'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { fetchJson } from '@/lib/fetchJson'

export default function AdminLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [navigating, setNavigating] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await fetchJson('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setNavigating(true)
      // Use replace instead of push + refresh to avoid extra server round-trip
      router.replace(searchParams.get('from') || '/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-wrap">
      {navigating && (
        <div className="login-loading-overlay">
          <div className="login-loading-spinner" />
          <p className="login-loading-text">Signing you in…</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="auth-card admin-form">
        <h1>Admin Login</h1>
        <p className="auth-card__subtitle">Sign in to manage Pehchaan Travels</p>
        {error && <div className="error-banner">{error}</div>}
        <div className="form-group form-group--icon">
          <label htmlFor="email">Email</label>
          <div className="form-input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            <input
              id="email"
              type="email"
              required
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={loading}
              autoComplete="email"
              autoFocus
            />
          </div>
        </div>
        <div className="form-group form-group--icon">
          <label htmlFor="password">Password</label>
          <div className="form-input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              disabled={loading}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="form-input-icon__toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              )}
            </button>
          </div>
        </div>
        <button type="submit" className="btn btn--primary btn--full" disabled={loading || navigating}>
          {loading ? (
            <span className="login-btn-loading">
              <span className="login-btn-spinner" />
              Signing in…
            </span>
          ) : (
            'Sign In'
          )}
        </button>
      </form>
    </div>
  )
}
