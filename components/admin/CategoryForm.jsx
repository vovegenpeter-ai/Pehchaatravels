'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { fetchJson } from '@/lib/fetchJson'
import { slugify } from '@/lib/slugify'
import ImageUploadField from '@/components/admin/ImageUploadField'
import RichTextEditor from '@/components/admin/RichTextEditor'

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  shortDescription: '',
  longDescription: '',
  type: 'DESTINATION',
  published: true,
  image: '',
  orderNumber: 0,
}

export default function CategoryForm({ categoryId = null }) {
  const router = useRouter()
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!categoryId) return
      try {
        const data = await fetchJson(`/api/admin/categories/${categoryId}`)
        if (!cancelled) setForm((prev) => ({ ...prev, ...data }))
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load category')
      }
    }
    load()
    return () => { cancelled = true }
  }, [categoryId])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    let nextValue = value
    if (name === 'slug') nextValue = slugify(value)
    if (name === 'orderNumber') nextValue = parseInt(value, 10) || 0
    setForm((prev) => {
      const updated = { ...prev, [name]: type === 'checkbox' ? checked : nextValue }
      if (name === 'name' && !updated.slug) updated.slug = slugify(value)
      return updated
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const url = categoryId ? `/api/admin/categories/${categoryId}` : '/api/admin/categories'
      const method = categoryId ? 'PUT' : 'POST'
      await fetchJson(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      router.push('/admin/categories')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      {error && <div className="error-banner">{error}</div>}
      <div className="admin-form-grid">
        <div className="form-group">
          <label>Name</label>
          <input name="name" required value={form.name} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Slug</label>
          <input name="slug" required value={form.slug} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>
            Order Number
            <small style={{ fontWeight: 400, color: '#6b7280', marginLeft: '0.5rem' }}>
              (Lower = shown first)
            </small>
          </label>
          <input
            name="orderNumber"
            type="number"
            value={form.orderNumber}
            onChange={handleChange}
            min={0}
          />
        </div>

        <div className="form-group form-group--full">
          <label>
            Description
            <small style={{ fontWeight: 400, color: '#6b7280', marginLeft: '0.5rem' }}>
              (Displayed on the frontend category page)
            </small>
          </label>
          <RichTextEditor
            value={form.longDescription || ''}
            onChange={(html) => setForm((prev) => ({ ...prev, longDescription: html }))}
            placeholder="Detailed description shown on the category page..."
          />
        </div>

        <input type="hidden" name="type" value={form.type} />
        <ImageUploadField label="Category Image" name="image" value={form.image || ''} onChange={handleChange} />
        <label className="checkbox-label">
          <input name="published" type="checkbox" checked={form.published} onChange={handleChange} /> Published
        </label>
      </div>
      <button type="submit" className="btn btn--primary btn--lg" disabled={loading} style={{ marginTop: '1.5rem' }}>
        {loading ? 'Saving...' : categoryId ? 'Update Category' : 'Create Category'}
      </button>
    </form>
  )
}
