'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchJson } from '@/lib/fetchJson'

export default function AdminHomePage() {
  const [tours, setTours] = useState([])
  const [hotels, setHotels] = useState([])
  const [destinations, setDestinations] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        // Fetched sequentially to avoid concurrent DB queries (the local dev
        // database is unstable under concurrent relation queries).
        const t = await fetchJson('/api/admin/tours')
        const h = await fetchJson('/api/admin/hotels')
        const d = await fetchJson('/api/admin/destinations')
        if (cancelled) return
        setTours(t)
        setHotels(h)
        setDestinations(d)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load content')
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const toggle = async (type, id, field, value) => {
    await fetch(`/api/admin/${type}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: !value }),
    })
    if (type === 'tours') setTours((prev) => prev.map((i) => i.id === id ? { ...i, [field]: !value } : i))
    if (type === 'hotels') setHotels((prev) => prev.map((i) => i.id === id ? { ...i, [field]: !value } : i))
    if (type === 'destinations') setDestinations((prev) => prev.map((i) => i.id === id ? { ...i, [field]: !value } : i))
  }

  return (
    <>
      <div className="admin-header"><h1>Home Page Featured Content</h1></div>
      <p style={{ marginBottom: '1.5rem', color: 'var(--text-light)' }}>
        Toggle which items appear in Featured Tours, Popular Tours, Latest Tours, Featured Hotels, and Popular Destinations on the home page.
      </p>
      {error && <div className="error-banner">{error}</div>}

      <h2 style={{ color: 'var(--green)', marginBottom: '1rem' }}>Tours</h2>
      <div className="admin-table-wrap" style={{ marginBottom: '2rem' }}>
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Featured</th><th>Popular</th><th>Latest</th><th>Edit</th></tr></thead>
          <tbody>
            {tours.map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td><input type="checkbox" checked={t.featured} onChange={() => toggle('tours', t.id, 'featured', t.featured)} /></td>
                <td><input type="checkbox" checked={t.popular} onChange={() => toggle('tours', t.id, 'popular', t.popular)} /></td>
                <td><input type="checkbox" checked={t.latest} onChange={() => toggle('tours', t.id, 'latest', t.latest)} /></td>
                <td><Link href={`/admin/tours/${t.id}`}>Edit</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ color: 'var(--green)', marginBottom: '1rem' }}>Hotels</h2>
      <div className="admin-table-wrap" style={{ marginBottom: '2rem' }}>
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Featured</th><th>Edit</th></tr></thead>
          <tbody>
            {hotels.map((h) => (
              <tr key={h.id}>
                <td>{h.name}</td>
                <td><input type="checkbox" checked={h.featured} onChange={() => toggle('hotels', h.id, 'featured', h.featured)} /></td>
                <td><Link href={`/admin/hotels/${h.id}`}>Edit</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ color: 'var(--green)', marginBottom: '1rem' }}>Destinations</h2>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Featured</th><th>Edit</th></tr></thead>
          <tbody>
            {destinations.map((d) => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td><input type="checkbox" checked={d.featured} onChange={() => toggle('destinations', d.id, 'featured', d.featured)} /></td>
                <td><Link href={`/admin/destinations/${d.id}`}>Edit</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
