'use client'

import { useEffect, useState } from 'react'
import { fetchJson } from '@/lib/fetchJson'

const PLATFORMS = [
  { key: 'facebookUrl', label: 'Facebook', icon: 'Facebook' },
  { key: 'instagramUrl', label: 'Instagram', icon: 'Instagram' },
  { key: 'youtubeUrl', label: 'YouTube', icon: 'YouTube' },
  { key: 'tiktokUrl', label: 'TikTok', icon: 'TikTok' },
]

export default function SocialMediaSettingsPage() {
  const [urls, setUrls] = useState({
    facebookUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
    tiktokUrl: '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchJson('/api/admin/home/social')
      .then((data) => {
        if (data && typeof data === 'object') {
          setUrls({
            facebookUrl: data.facebookUrl || '',
            instagramUrl: data.instagramUrl || '',
            youtubeUrl: data.youtubeUrl || '',
            tiktokUrl: data.tiktokUrl || '',
          })
        }
      })
      .catch(() => setError('Failed to load social media settings'))
  }, [])

  const handleChange = (key, value) => {
    setUrls((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      await fetchJson('/api/admin/home/social', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(urls),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="admin-header"><h1>Follow Us — Social Media Settings</h1></div>
      <p style={{ marginBottom: '1.5rem', color: 'var(--text-light)' }}>
        Manage the social media links that appear on the Home Page. Leave a URL blank to hide that platform&apos;s icon.
      </p>

      {error && <div className="error-banner">{error}</div>}
      {saved && (
        <div
          className="error-banner"
          style={{ background: '#dcfce7', color: '#166534', marginBottom: '1rem' }}
        >
          Settings saved successfully
        </div>
      )}

      <div className="admin-form" style={{ maxWidth: '640px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {PLATFORMS.map(({ key, label }) => (
            <div key={key} className="form-group">
              <label htmlFor={key} style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                {label} URL
              </label>
              <input
                id={key}
                type="url"
                placeholder={`https://${label.toLowerCase()}.com/your-page`}
                value={urls[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                className="form-input"
                style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid var(--beige-dark)', borderRadius: 'var(--radius-sm)', fontSize: '0.95rem', outline: 'none' }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--green)')}
                onBlur={(e) => (e.target.style.borderColor = '')}
              />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '0.3rem' }}>
                Enter the full URL (including https://). Leave empty to hide this icon on the home page.
              </p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn btn--primary"
          >
            {saving ? (
              <>
                <span className="btn-save-spinner" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>
      </div>
    </>
  )
}
