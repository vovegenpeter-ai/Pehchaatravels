'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import ImageUploadField from '@/components/admin/ImageUploadField'
import ItineraryBuilder from '@/components/admin/ItineraryBuilder'
import { fetchJson } from '@/lib/fetchJson'
import { slugify } from '@/lib/slugify'

const emptyForm = {
  name: '', slug: '', shortDescription: '', fullDescription: '', destination: '',
  location: '', price: '', duration: '', days: '', startDate: '', startTime: '',
  endDate: '', endTime: '', meetingPoint: '', bannerImage: '', extraImages: '',
  includedServices: '', excludedServices: '', maxGuests: '', rating: '4.5',
  published: true, featured: false, popular: false, latest: false, categoryId: '',
  itinerary: [],
}

export default function TourForm({ tourId = null }) {
  const router = useRouter()
  const [form, setForm] = useState(emptyForm)
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const cats = await fetchJson('/api/admin/categories')
        if (cancelled) return
        setCategories(cats)
        if (tourId) {
          const t = await fetchJson(`/api/admin/tours/${tourId}`)
          if (cancelled) return
          setForm({
            name: t.name, slug: t.slug, shortDescription: t.shortDescription,
            fullDescription: t.fullDescription, destination: t.destination,
            location: t.location || '', price: String(t.price), duration: t.duration,
            days: String(t.days), startDate: t.startDate || '', startTime: t.startTime || '',
            endDate: t.endDate || '', endTime: t.endTime || '', meetingPoint: t.meetingPoint || '',
            bannerImage: t.bannerImage, extraImages: (t.images || []).filter((i) => i !== t.bannerImage).join('\n'),
            includedServices: (t.includedServices || []).join('\n'),
            excludedServices: (t.excludedServices || []).join('\n'),
            maxGuests: t.maxGuests ? String(t.maxGuests) : '',
            rating: String(t.rating), published: t.published, featured: t.featured,
            popular: t.popular, latest: t.latest, categoryId: t.categoryId || '',
            itinerary: Array.isArray(t.itinerary) ? t.itinerary : [],
          })
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load tour')
      }
    }
    load()
    return () => { cancelled = true }
  }, [tourId])

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const extraImages = form.extraImages.split('\n').map((s) => s.trim()).filter(Boolean)
      const payload = {
        name: form.name,
        slug: form.slug,
        shortDescription: form.shortDescription,
        fullDescription: form.fullDescription,
        destination: form.destination,
        location: form.location || form.destination,
        price: Number(form.price),
        duration: form.duration,
        days: Number(form.days),
        startDate: form.startDate,
        startTime: form.startTime,
        endDate: form.endDate,
        endTime: form.endTime,
        meetingPoint: form.meetingPoint,
        bannerImage: form.bannerImage,
        images: [form.bannerImage, ...extraImages],
        includedServices: form.includedServices.split('\n').map((s) => s.trim()).filter(Boolean),
        excludedServices: form.excludedServices.split('\n').map((s) => s.trim()).filter(Boolean),
        maxGuests: form.maxGuests ? Number(form.maxGuests) : undefined,
        rating: Number(form.rating),
        published: form.published,
        featured: form.featured,
        popular: form.popular,
        latest: form.latest,
        categoryId: form.categoryId || null,
        itinerary: form.itinerary,
      }

      const url = tourId ? `/api/admin/tours/${tourId}` : '/api/admin/tours'
      const method = tourId ? 'PUT' : 'POST'
      await fetchJson(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      router.push('/admin/tours')
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
        <div className="form-group"><label>Slug</label><input name="slug" required value={form.slug} onChange={handleChange} placeholder="hunza-valley-tour" /></div>
        {/* Short Description */}
        <div className="form-group form-group--full">
          <label>
            Short Description <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: '#64748b' }}>(Displayed on Cards across Home & Tours pages)</span>
          </label>
          <textarea
            name="shortDescription"
            rows={3}
            required
            value={form.shortDescription}
            onChange={handleChange}
            placeholder="A brief 1-2 sentence summary shown on tour cards..."
          />
        </div>

        {/* Long Description */}
        <div className="form-group form-group--full">
          <label>
            Long Description <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: '#64748b' }}>(Displayed on the Tour Detail Page)</span>
          </label>
          <textarea
            name="fullDescription"
            rows={6}
            required
            value={form.fullDescription}
            onChange={handleChange}
            placeholder="Comprehensive description and overview shown on the tour detail page..."
          />
        </div>
        <div className="form-group"><label>Destination</label><input name="destination" required value={form.destination} onChange={handleChange} /></div>
        <div className="form-group"><label>Location</label><input name="location" value={form.location} onChange={handleChange} /></div>
        <div className="form-group"><label>Price (PKR)</label><input name="price" type="number" required value={form.price} onChange={handleChange} /></div>
        <div className="form-group"><label>Duration</label><input name="duration" required value={form.duration} onChange={handleChange} placeholder="7 Days / 6 Nights" /></div>
        <div className="form-group"><label>Days</label><input name="days" type="number" required value={form.days} onChange={handleChange} /></div>
        <div className="form-group"><label>Rating</label><input name="rating" type="number" step="0.1" min="0" max="5" value={form.rating} onChange={handleChange} /></div>
        <div className="form-group"><label>Start Date</label><input name="startDate" value={form.startDate} onChange={handleChange} /></div>
        <div className="form-group"><label>Start Time</label><input name="startTime" value={form.startTime} onChange={handleChange} /></div>
        <div className="form-group"><label>End Date</label><input name="endDate" value={form.endDate} onChange={handleChange} /></div>
        <div className="form-group"><label>End Time</label><input name="endTime" value={form.endTime} onChange={handleChange} /></div>
        <div className="form-group form-group--full"><label>Meeting Point</label><input name="meetingPoint" value={form.meetingPoint} onChange={handleChange} /></div>
        <ImageUploadField label="Banner Image" name="bannerImage" value={form.bannerImage} onChange={handleChange} />
        <div className="form-group form-group--full"><label>Additional Image URLs (one per line)</label><textarea name="extraImages" rows={3} value={form.extraImages} onChange={handleChange} /></div>
        <div className="form-group"><label>Included Services (one per line)</label><textarea name="includedServices" rows={4} value={form.includedServices} onChange={handleChange} /></div>
        <div className="form-group"><label>Excluded Services (one per line)</label><textarea name="excludedServices" rows={4} value={form.excludedServices} onChange={handleChange} /></div>
        <div className="form-group"><label>Max Guests</label><input name="maxGuests" type="number" value={form.maxGuests} onChange={handleChange} /></div>
        <div className="form-group"><label>Category</label>
          <select name="categoryId" value={form.categoryId} onChange={handleChange}>
            <option value="">None</option>
            {categories.filter((c) => c.type === 'TOUR').map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group form-group--full">
          <label style={{ marginBottom: '0.75rem', display: 'block' }}>Itinerary</label>
          <ItineraryBuilder value={form.itinerary} onChange={(val) => setForm((prev) => ({ ...prev, itinerary: val }))} />
        </div>
        <label className="checkbox-label"><input name="published" type="checkbox" checked={form.published} onChange={handleChange} /> Published</label>
        <label className="checkbox-label"><input name="featured" type="checkbox" checked={form.featured} onChange={handleChange} /> Featured</label>
        <label className="checkbox-label"><input name="popular" type="checkbox" checked={form.popular} onChange={handleChange} /> Popular</label>
        <label className="checkbox-label"><input name="latest" type="checkbox" checked={form.latest} onChange={handleChange} /> Latest</label>
      </div>
      <button type="submit" className="btn btn--primary btn--lg" disabled={loading} style={{ marginTop: '1.5rem' }}>
        {loading ? 'Saving...' : tourId ? 'Update Tour' : 'Create Tour'}
      </button>
    </form>
  )
}
