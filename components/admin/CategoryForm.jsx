'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { fetchJson } from '@/lib/fetchJson'
import { slugify } from '@/lib/slugify'

const emptyForm = { name: '', slug: '', description: '', type: 'TOUR', published: true }

export default function CategoryForm({ categoryId = null, prefillType = null }) {
  const router = useRouter()
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    ...(prefillType ? { type: prefillType } : {}),
  }))
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
        <div className="form-group"><label>Name</label><input name="name" required value={form.name} onChange={handleChange} /></div>
        <div className="form-group"><label>Slug</label><input name="slug" required value={form.slug} onChange={handleChange} /></div>
        <div className="form-group form-group--full"><label>Description</label><textarea name="description" rows={3} value={form.description || ''} onChange={handleChange} /></div>
        <div className="form-group"><label>Type</label>
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="TOUR">Tours</option>
            <option value="HOTEL">Hotels</option>
            <option value="DESTINATION">Destinations</option>
            <option value="ACTIVITY">Activities</option>
          </select>
        </div>
        <label className="checkbox-label"><input name="published" type="checkbox" checked={form.published} onChange={handleChange} /> Published</label>
      </div>
      <button type="submit" className="btn btn--primary btn--lg" disabled={loading} style={{ marginTop: '1.5rem' }}>
        {loading ? 'Saving...' : categoryId ? 'Update Category' : 'Create Category'}
      </button>
    </form>
  )
}
