'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ImageUploadField from '@/components/admin/ImageUploadField'
import RichTextEditor from '@/components/admin/RichTextEditor'
import { fetchJson } from '@/lib/fetchJson'
import { slugify } from '@/lib/slugify'

const emptyForm = {
  name: '', slug: '', shortDescription: '', fullDescription: '', image: '',
  published: true, featured: false, orderNumber: 0, categoryId: '',
}

export default function DestinationForm({ destinationId = null }) {
  const router = useRouter()
  const [form, setForm] = useState(emptyForm)
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [cats] = await Promise.allSettled([
        fetchJson('/api/admin/categories?type=DESTINATION'),
      ])
      if (cancelled) return
      if (cats.status === 'fulfilled') setCategories(cats.value)

      if (destinationId) {
        try {
          const d = await fetchJson(`/api/admin/destinations/${destinationId}`)
          if (cancelled) return
          setForm({
            name: d.name,
            slug: d.slug,
            shortDescription: d.shortDescription || d.description || '',
            fullDescription: d.fullDescription || d.description || '',
            image: d.image,
            published: d.published,
            featured: d.featured,
            orderNumber: d.orderNumber || 0,
            categoryId: d.categoryId || '',

          })
        } catch (e) {
          if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load destination')
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [destinationId])

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

    if (form.shortDescription.length < 10) {
      setError('Short Description must be at least 10 characters long')
      return
    }
    if (form.fullDescription.length < 20) {
      setError('Long Description must be at least 20 characters long')
      return
    }

    setLoading(true)
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        shortDescription: form.shortDescription,
        fullDescription: form.fullDescription,
        description: form.fullDescription || form.shortDescription,
        image: form.image,
        published: form.published,
        featured: form.featured,
        orderNumber: form.orderNumber,
        categoryId: form.categoryId || null,

      }

      const url = destinationId ? `/api/admin/destinations/${destinationId}` : '/api/admin/destinations'
      const method = destinationId ? 'PUT' : 'POST'
      await fetchJson(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      router.push('/admin/destinations')
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
        <div className="form-group"><label>Name</label><input name="name" required value={form.name} onChange={handleChange} /></div>
        <div className="form-group"><label>Slug</label><input name="slug" required value={form.slug} onChange={handleChange} placeholder="hunza" /></div>

        {/* Short Description */}
        <div className="form-group form-group--full">
          <label>
            Short Description <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: '#64748b' }}>(Displayed on Cards across Home & Places pages)</span>
          </label>
          <textarea
            name="shortDescription"
            rows={3}
            required
            value={form.shortDescription}
            onChange={handleChange}
            placeholder="A brief 1-2 sentence overview shown on cards..."
          />
        </div>

        {/* Long Description */}
        <div className="form-group form-group--full">
          <label>
            Long Description <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: '#64748b' }}>(Displayed on the Destination Detail Page)</span>
          </label>
          <RichTextEditor
            value={form.fullDescription}
            onChange={(html) => setForm((prev) => ({ ...prev, fullDescription: html }))}
            placeholder="Detailed overview and background shown on the place detail page..."
          />
        </div>

        <ImageUploadField label="Destination Image" name="image" value={form.image} onChange={handleChange} />
        <div className="form-group">
          <label>Category</label>
          <select name="categoryId" value={form.categoryId} onChange={handleChange}>
            <option value="">None</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <label className="checkbox-label"><input name="published" type="checkbox" checked={form.published} onChange={handleChange} /> Published</label>
        <label className="checkbox-label"><input name="featured" type="checkbox" checked={form.featured} onChange={handleChange} /> Featured</label>
        <div className="form-group">
          <label>Order Number</label>
          <input
            name="orderNumber"
            type="number"
            value={form.orderNumber}
            onChange={handleChange}
            min={0}
            placeholder="0"
          />
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>Lower = shown first. 0 = no custom order.</p>
        </div>
      </div>

      <button type="submit" className="btn btn--primary btn--lg" disabled={loading} style={{ marginTop: '1.5rem' }}>
        {loading ? 'Saving...' : destinationId ? 'Update Explore Places' : 'Add Explore Places'}
      </button>
    </form>
  )
}
