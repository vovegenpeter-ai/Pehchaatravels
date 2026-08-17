'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ImageUploadField from '@/components/admin/ImageUploadField'
import { fetchJson } from '@/lib/fetchJson'
import { slugify } from '@/lib/slugify'

const emptyForm = {
  name: '', slug: '', description: '', location: '', image: '',
  published: true, featured: false, categoryId: '', tourIds: [], hotelIds: [],
}

export default function DestinationForm({ destinationId = null }) {
  const router = useRouter()
  const [form, setForm] = useState(emptyForm)
  const [categories, setCategories] = useState([])
  const [tours, setTours] = useState([])
  const [hotels, setHotels] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        // Fetched sequentially to avoid concurrent DB queries (the local dev
        // database is unstable under concurrent relation queries).
        const cats = await fetchJson('/api/admin/categories')
        const t = await fetchJson('/api/admin/tours')
        const h = await fetchJson('/api/admin/hotels')
        if (cancelled) return
        setCategories(cats)
        setTours(t)
        setHotels(h)

        if (destinationId) {
          const d = await fetchJson(`/api/admin/destinations/${destinationId}`)
          if (cancelled) return
          setForm({
            name: d.name, slug: d.slug, description: d.description,
            location: d.location, image: d.image,
            published: d.published, featured: d.featured,
            categoryId: d.categoryId || '', tourIds: d.tourIds || [], hotelIds: d.hotelIds || [],
          })
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load destination')
      }
    }
    load()
    return () => { cancelled = true }
  }, [destinationId])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    let nextValue = value
    if (name === 'slug') nextValue = slugify(value)
    setForm((prev) => {
      const updated = { ...prev, [name]: type === 'checkbox' ? checked : nextValue }
      // Auto-fill the slug from the name while the admin hasn't set one yet.
      if (name === 'name' && !updated.slug) updated.slug = slugify(value)
      return updated
    })
  }

  const toggleRelation = (field, id) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(id)
        ? prev[field].filter((x) => x !== id)
        : [...prev[field], id],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description,
        location: form.location,
        image: form.image,
        published: form.published,
        featured: form.featured,
        categoryId: form.categoryId || null,
        tourIds: form.tourIds,
        hotelIds: form.hotelIds,
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
        <div className="form-group"><label>Location</label><input name="location" required value={form.location} onChange={handleChange} /></div>
        <div className="form-group form-group--full"><label>Description</label><textarea name="description" rows={5} required value={form.description} onChange={handleChange} /></div>
        <ImageUploadField label="Destination Image" name="image" value={form.image} onChange={handleChange} />
        <div className="form-group"><label>Category</label>
          <select name="categoryId" value={form.categoryId} onChange={handleChange}>
            <option value="">None</option>
            {categories.filter((c) => c.type === 'DESTINATION').map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <label className="checkbox-label"><input name="published" type="checkbox" checked={form.published} onChange={handleChange} /> Published</label>
        <label className="checkbox-label"><input name="featured" type="checkbox" checked={form.featured} onChange={handleChange} /> Featured</label>
      </div>

      <div className="admin-relations" style={{ marginTop: '2rem' }}>
        <h3>Related Tours</h3>
        <div className="admin-checkbox-grid">
          {tours.map((t) => (
            <label key={t.id} className="checkbox-label">
              <input type="checkbox" checked={form.tourIds.includes(t.id)} onChange={() => toggleRelation('tourIds', t.id)} />
              {t.name}
            </label>
          ))}
        </div>

        <h3 style={{ marginTop: '1.5rem' }}>Related Hotels</h3>
        <div className="admin-checkbox-grid">
          {hotels.map((h) => (
            <label key={h.id} className="checkbox-label">
              <input type="checkbox" checked={form.hotelIds.includes(h.id)} onChange={() => toggleRelation('hotelIds', h.id)} />
              {h.name}
            </label>
          ))}
        </div>
      </div>

      <button type="submit" className="btn btn--primary btn--lg" disabled={loading} style={{ marginTop: '1.5rem' }}>
        {loading ? 'Saving...' : destinationId ? 'Update Destination' : 'Create Destination'}
      </button>
    </form>
  )
}
