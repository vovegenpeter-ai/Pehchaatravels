'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { fetchJson } from '@/lib/fetchJson'

function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatDate(date) {
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/** Resize and compress an image file to a data URL (max ~200x200, JPEG 0.8) */
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_SIZE = 200
        let { width, height } = img

        if (width > height) {
          if (width > MAX_SIZE) { height = (height * MAX_SIZE) / width; width = MAX_SIZE }
        } else {
          if (height > MAX_SIZE) { width = (width * MAX_SIZE) / height; height = MAX_SIZE }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.onerror = () => reject(new Error('Failed to read image'))
      img.src = e.target.result
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export default function ProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarData, setAvatarData] = useState(null) // base64 to save
  const [avatarRemoved, setAvatarRemoved] = useState(false)

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    fetch('/api/auth/profile')
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated')
        return res.json()
      })
      .then((data) => {
        setUser(data.user)
        setAvatarPreview(data.user.avatar || null)
        setForm({
          fullName: data.user.fullName,
          email: data.user.email,
          phone: data.user.phone,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
      })
      .catch(() => router.push('/sign-in'))
      .finally(() => setLoading(false))
  }, [router])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    try {
      const compressed = await compressImage(file)
      setAvatarPreview(compressed)
      setAvatarData(compressed)
      setAvatarRemoved(false)
      setError('')
    } catch {
      setError('Failed to process image')
    }
  }

  const handleRemoveAvatar = () => {
    setAvatarPreview(null)
    setAvatarData(null)
    setAvatarRemoved(true)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (form.newPassword && form.newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }

    setSaving(true)
    try {
      const body = {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
      }

      if (form.newPassword) {
        body.currentPassword = form.currentPassword
        body.newPassword = form.newPassword
      }

      // Only send avatar if changed
      if (avatarData) {
        body.avatar = avatarData
      } else if (avatarRemoved) {
        body.avatar = null // user removed avatar
      }

      const data = await fetchJson('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      setUser(data.user)
      setAvatarPreview(data.user.avatar || null)
      setAvatarData(null)
      setAvatarRemoved(false)
      setEditing(false)
      setSuccess('Profile updated successfully!')
      setForm((prev) => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }))
      // Notify header to re-fetch user data
      window.dispatchEvent(new Event('user-profile-updated'))
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/me', { method: 'DELETE' })
      router.push('/')
      router.refresh()
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <section className="profile-section">
        <div className="container">
          <div className="loading">
            <div className="loading__spinner" />
            <p>Loading profile...</p>
          </div>
        </div>
      </section>
    )
  }

  if (!user) return null

  const displayAvatar = avatarRemoved ? null : (avatarPreview || user.avatar)

  return (
    <section className="profile-section">
      <div className="container">
        <div className="profile-card">
          {/* Header with avatar */}
          <div className="profile-card__header">
            <div className="profile-card__avatar">
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt={user.fullName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                />
              ) : (
                getInitials(user.fullName)
              )}
            </div>
            <h2>{user.fullName}</h2>
            <p>Member since {formatDate(user.createdAt)}</p>
          </div>

          <div className="profile-card__body">
            {success && <div className="success-banner">{success}</div>}
            {error && <div className="error-banner">{error}</div>}

            {editing ? (
              <form onSubmit={handleSubmit}>
                {/* Avatar Upload */}
                <div className="profile-avatar-edit">
                  <h3>Profile Photo</h3>
                  <div className="profile-avatar-upload">
                    <div className="profile-avatar-upload__preview" onClick={() => fileInputRef.current?.click()}>
                      {displayAvatar ? (
                        <img src={displayAvatar} alt="Preview" />
                      ) : (
                        <span className="profile-avatar-upload__placeholder">
                          {getInitials(form.fullName)}
                        </span>
                      )}
                      <div className="profile-avatar-upload__overlay">
                        📷 Change
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleAvatarChange}
                      style={{ display: 'none' }}
                    />
                    <div className="profile-avatar-upload__actions">
                      <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Upload Photo
                      </button>
                      {(displayAvatar || user.avatar) && (
                        <button
                          type="button"
                          className="btn btn--sm"
                          style={{ color: '#c0392b', borderColor: '#c0392b' }}
                          onClick={handleRemoveAvatar}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="profile-avatar-upload__hint">JPG, PNG or WebP. Max 5MB. Will be resized to 200×200.</p>
                  </div>
                </div>

                <h3>Edit Profile</h3>
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={form.fullName}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    required
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>

                <h3 style={{ marginTop: '1.5rem' }}>Change Password <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-light)' }}>(optional)</span></h3>
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    placeholder="Enter current password to change"
                    value={form.currentPassword}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    minLength={6}
                    placeholder="At least 6 characters"
                    value={form.newPassword}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                  />
                </div>

                <div className="profile-card__actions">
                  <button type="submit" className="btn btn--primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    className="btn btn--outline"
                    onClick={() => {
                      setEditing(false)
                      setError('')
                      setSuccess('')
                      setAvatarPreview(user.avatar || null)
                      setAvatarData(null)
                      setAvatarRemoved(false)
                      setForm((prev) => ({
                        ...prev,
                        fullName: user.fullName,
                        email: user.email,
                        phone: user.phone,
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                      }))
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h3>Personal Information</h3>
                <div className="profile-info-grid">
                  <div className="profile-info-item">
                    <label>Full Name</label>
                    <span>{user.fullName}</span>
                  </div>
                  <div className="profile-info-item">
                    <label>Email</label>
                    <span>{user.email}</span>
                  </div>
                  <div className="profile-info-item">
                    <label>Phone</label>
                    <span>{user.phone}</span>
                  </div>
                  <div className="profile-info-item">
                    <label>Member Since</label>
                    <span>{formatDate(user.createdAt)}</span>
                  </div>
                </div>

                <div className="profile-card__actions">
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => setEditing(true)}
                  >
                    ✏️ Edit Profile
                  </button>
                  <button
                    type="button"
                    className="btn btn--outline"
                    onClick={handleSignOut}
                  >
                    🚪 Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
