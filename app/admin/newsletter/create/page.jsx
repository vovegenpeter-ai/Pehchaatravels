'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateNewsletterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    subject: '',
    title: '',
    content: '',
    image: '',
    ctaText: '',
    ctaUrl: '',
  })
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSaveDraft = async () => {
    if (!form.subject || !form.title || !form.content) {
      setError('Subject, title, and content are required')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, status: 'draft' }),
      })
      if (!res.ok) throw new Error('Failed to save draft')
      setSuccess('Draft saved successfully!')
      setTimeout(() => router.push('/admin/newsletter/drafts'), 1500)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save draft')
    } finally {
      setSaving(false)
    }
  }

  const handleSend = async () => {
    if (!form.subject || !form.title || !form.content) {
      setError('Subject, title, and content are required')
      return
    }

    // Confirm before sending
    const confirmed = window.confirm(
      'Are you sure you want to send this newsletter to all active subscribers?'
    )
    if (!confirmed) return

    setSending(true)
    setError('')
    try {
      // First create the newsletter
      const createRes = await fetch('/api/admin/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, status: 'draft' }),
      })
      if (!createRes.ok) throw new Error('Failed to create newsletter')
      const newsletter = await createRes.json()

      // Then send it
      const sendRes = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsletterId: newsletter.id }),
      })
      if (!sendRes.ok) throw new Error('Failed to send newsletter')
      const result = await sendRes.json()

      setSuccess(result.message)
      setTimeout(() => router.push('/admin/newsletter/sent'), 2000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send newsletter')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <div className="admin-header">
        <h1>Create Newsletter</h1>
      </div>

      {error && <div className="cq-error">{error}</div>}
      {success && (
        <div style={{ padding: '1rem', background: '#d1fae5', color: '#065f46', borderRadius: '8px', marginBottom: '1rem' }}>
          {success}
        </div>
      )}

      <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
        <div className="form-group">
          <label htmlFor="subject">Subject</label>
          <input
            id="subject"
            name="subject"
            type="text"
            value={form.subject}
            onChange={handleChange}
            placeholder="Enter newsletter subject (e.g., New Travel Packages Available)"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter newsletter title (e.g., Explore Our Latest Travel Deals)"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            name="content"
            value={form.content}
            onChange={handleChange}
            placeholder="Write your newsletter content here. You can use HTML for formatting."
            rows={12}
            required
            style={{ fontFamily: 'monospace', fontSize: '14px' }}
          />
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '0.5rem' }}>
            Tip: You can use HTML tags like &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;a&gt;, etc. for formatting.
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="image">Image URL (optional)</label>
          <input
            id="image"
            name="image"
            type="url"
            value={form.image}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
          <div className="form-group">
            <label htmlFor="ctaText">CTA Button Text (optional)</label>
            <input
              id="ctaText"
              name="ctaText"
              type="text"
              value={form.ctaText}
              onChange={handleChange}
              placeholder="e.g., Explore Packages"
            />
          </div>
          <div className="form-group">
            <label htmlFor="ctaUrl">CTA Button URL (optional)</label>
            <input
              id="ctaUrl"
              name="ctaUrl"
              type="url"
              value={form.ctaUrl}
              onChange={handleChange}
              placeholder="https://pehchaantravels.vercel.app/tours"
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button
            onClick={handleSaveDraft}
            className="btn btn--outline"
            disabled={saving || sending}
          >
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            onClick={handleSend}
            className="btn btn--primary"
            disabled={saving || sending}
          >
            {sending ? 'Sending...' : 'Send Newsletter'}
          </button>
        </div>
      </div>
    </>
  )
}
