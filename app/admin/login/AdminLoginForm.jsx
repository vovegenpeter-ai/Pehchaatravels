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
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            disabled={loading}
            autoComplete="email"
            autoFocus
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            disabled={loading}
            autoComplete="current-password"
          />
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
