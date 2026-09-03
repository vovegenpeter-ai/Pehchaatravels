'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ImageUploadField from '@/components/admin/ImageUploadField'
import RichTextEditor from '@/components/admin/RichTextEditor'
import { fetchJson } from '@/lib/fetchJson'
import { slugify } from '@/lib/slugify'

const emptyForm = {
  name: '', slug: '', shortDescription: '', fullDescription: '', location: '', address: '',
  pricePerNight: '', rating: '4.5', contactPhone: '', contactEmail: '',
  checkInTime: '2:00 PM', checkOutTime: '12:00 PM',
  bannerImage: '', extraImages: '', amenities: '', roomTypes: '',
  published: true, featured: false, categoryId: '',
}

export default function HotelForm({ hotelId = null }) {
  const router = useRouter()
  const [form, setForm] = useState(emptyForm)
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(!!hotelId)

  useEffect(() => {
    let cancelled = false
    async function load() {
      /* Load each resource independently — a failure in one never blocks the others */
      const catsResult = await Promise.allSettled([
        fetchJson('/api/admin/categories?type=HOTEL'),
      ])
      if (cancelled) return
      if (catsResult[0].status === 'fulfilled') setCategories(catsResult[0].value)

      if (hotelId) {
        try {
          const h = await fetchJson(`/api/admin/hotels/${hotelId}`)
          if (cancelled) return
          setForm({
            name: h.name,
            slug: h.slug,
            shortDescription: h.shortDescription || h.description || '',
            fullDescription: h.fullDescription || h.description || '',
            location: h.location,
            address: h.address || '',
            pricePerNight: String(h.pricePerNight),
            rating: String(h.rating),
            contactPhone: h.contactPhone || '',
            contactEmail: h.contactEmail || '',
            checkInTime: h.checkInTime || '2:00 PM',
            checkOutTime: h.checkOutTime || '12:00 PM',
            bannerImage: h.bannerImage,
            extraImages: (h.images || []).filter((i) => i !== h.bannerImage).join('\n'),
            amenities: (h.amenities || []).join('\n'),
            roomTypes: JSON.stringify(h.roomTypes || [], null, 2),
            published: h.published,
            featured: h.featured,
            categoryId: h.categoryId || '',
          })
        } catch (e) {
          if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load hotel')
        } finally {
          if (!cancelled) setDataLoading(false)
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [hotelId])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    let nextValue = value
    if (name === 'slug') nextValue = slugify(value)
    setForm((prev) => {
      const updated = { ...prev, [name]: type === 'checkbox' ? checked : nextValue }
      if (name === 'name' && !updated.slug) updated.slug = slugify(value)
      return updated
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Client-side validation for descriptions
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
      const extraImages = form.extraImages.split('\n').map((s) => s.trim()).filter(Boolean)
      const payload = {
        name: form.name,
        slug: form.slug,
        shortDescription: form.shortDescription,
        fullDescription: form.fullDescription,
        description: form.fullDescription || form.shortDescription,
        location: form.location,
        address: form.address,
        pricePerNight: Number(form.pricePerNight),
        rating: Number(form.rating),
        contactPhone: form.contactPhone,
        contactEmail: form.contactEmail,
        checkInTime: form.checkInTime,
        checkOutTime: form.checkOutTime,
        bannerImage: form.bannerImage,
        images: [form.bannerImage, ...extraImages],
        amenities: form.amenities.split('\n').map((s) => s.trim()).filter(Boolean),
        roomTypes: form.roomTypes ? JSON.parse(form.roomTypes) : [],
        published: form.published,
        featured: form.featured,
        categoryId: form.categoryId || null,
      }

      const url = hotelId ? `/api/admin/hotels/${hotelId}` : '/api/admin/hotels'
      const method = hotelId ? 'PUT' : 'POST'
      await fetchJson(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      router.push('/admin/hotels')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  if (dataLoading) {
    return (
      <div className="page-spinner-wrap" style={{ minHeight: '50vh' }}>
        <div className="page-spinner" />
        <p className="page-spinner-text">Loading hotel data…</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      {error && <div className="error-banner">{error}</div>}
      <div className="admin-form-grid">
        <div className="form-group"><label>Name</label><input name="name" required value={form.name} onChange={handleChange} /></div>
        <div className="form-group"><label>Slug</label><input name="slug" required value={form.slug} onChange={handleChange} placeholder="serena-hotel-hunza" /></div>

        {/* Short Description */}
        <div className="form-group form-group--full">
          <label>
            Short Description <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: '#64748b' }}>(Displayed on Cards across Home & Hotels pages)</span>
          </label>
          <textarea
            name="shortDescription"
            rows={3}
            required
            value={form.shortDescription}
            onChange={handleChange}
            placeholder="A brief 1-2 sentence overview shown on hotel cards..."
          />
        </div>

        {/* Long Description */}
        <div className="form-group form-group--full">
          <label>
            Long Description <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: '#64748b' }}>(Displayed on the Hotel Detail Page)</span>
          </label>
          <RichTextEditor
            value={form.fullDescription}
            onChange={(html) => setForm((prev) => ({ ...prev, fullDescription: html }))}
            placeholder="Comprehensive description and amenities info shown on the hotel detail page..."
          />
        </div>

        <div className="form-group"><label>Location</label><input name="location" required value={form.location} onChange={handleChange} /></div>
        <div className="form-group"><label>Address</label><input name="address" value={form.address} onChange={handleChange} /></div>
        <div className="form-group"><label>Price per Night (PKR)</label><input name="pricePerNight" type="number" required value={form.pricePerNight} onChange={handleChange} /></div>
        <div className="form-group"><label>Rating</label><input name="rating" type="number" step="0.1" min="0" max="5" value={form.rating} onChange={handleChange} /></div>
        <div className="form-group"><label>Contact Phone</label><input name="contactPhone" value={form.contactPhone} onChange={handleChange} /></div>
        <div className="form-group"><label>Contact Email</label><input name="contactEmail" type="email" value={form.contactEmail} onChange={handleChange} /></div>
        <div className="form-group"><label>Check-in Time</label><input name="checkInTime" value={form.checkInTime} onChange={handleChange} /></div>
        <div className="form-group"><label>Check-out Time</label><input name="checkOutTime" value={form.checkOutTime} onChange={handleChange} /></div>
        <ImageUploadField label="Banner Image" name="bannerImage" value={form.bannerImage} onChange={handleChange} />
        <div className="form-group form-group--full"><label>Additional Image URLs (one per line)</label><textarea name="extraImages" rows={3} value={form.extraImages} onChange={handleChange} /></div>
        <div className="form-group"><label>Amenities (one per line)</label><textarea name="amenities" rows={4} value={form.amenities} onChange={handleChange} /></div>
        <div className="form-group"><label>Room Types (JSON)</label><textarea name="roomTypes" rows={6} value={form.roomTypes} onChange={handleChange} placeholder='[{"name":"Standard","price":15000}]' /></div>
        <div className="form-group"><label>Category</label>
          <select name="categoryId" value={form.categoryId} onChange={handleChange}>
            <option value="">None</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <label className="checkbox-label"><input name="published" type="checkbox" checked={form.published} onChange={handleChange} /> Published</label>
        <label className="checkbox-label"><input name="featured" type="checkbox" checked={form.featured} onChange={handleChange} /> Featured</label>
      </div>
      <button type="submit" className="btn btn--primary btn--lg" disabled={loading} style={{ marginTop: '1.5rem' }}>
        {loading ? <span className="btn-save-loading"><span className="btn-save-spinner" /> Saving…</span> : hotelId ? 'Update Hotel' : 'Create Hotel'}
      </button>
    </form>
  )
}
