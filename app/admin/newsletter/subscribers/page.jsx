'use client'

import { useCallback, useEffect, useState } from 'react'
import ConfirmDialog from '@/components/admin/ConfirmDialog'

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const fetchSubscribers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (search.trim()) params.set('search', search.trim())
      if (status) params.set('status', status)
      const res = await fetch(`/api/admin/newsletter/subscribers?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load subscribers')
      setSubscribers(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load subscribers')
    } finally {
      setLoading(false)
    }
  }, [search, status])

  useEffect(() => {
    const timer = setTimeout(fetchSubscribers, 200)
    return () => clearTimeout(timer)
  }, [fetchSubscribers])

  const [confirmDelete, setConfirmDelete] = useState(null)

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/admin/newsletter/subscribers?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete subscriber')
      setSubscribers((prev) => prev.filter((s) => s.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete subscriber')
    }
  }

  const exportCSV = () => {
    const headers = ['Email', 'Status', 'Subscribed At', 'Unsubscribed At']
    const rows = subscribers.map((s) => [
      s.email,
      s.status,
      new Date(s.subscribedAt).toLocaleString(),
      s.unsubscribedAt ? new Date(s.unsubscribedAt).toLocaleString() : '',
    ])
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatDate = (iso) =>
    new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })

  return (
    <>
      <div className="admin-header">
        <h1>Newsletter Subscribers</h1>
        <button onClick={exportCSV} className="btn btn--primary btn--sm" style={{ marginLeft: 'auto' }}>
          Export CSV
        </button>
      </div>

      <div className="cq-toolbar">
        <input
          type="search"
          className="cq-search"
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="cq-select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="unsubscribed">Unsubscribed</option>
        </select>
      </div>

      {error && <p className="cq-error">{error}</p>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Status</th>
              <th>Subscribed At</th>
              <th>Unsubscribed At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="cq-empty">Loading subscribers...</td>
              </tr>
            ) : subscribers.length === 0 ? (
              <tr>
                <td colSpan="5" className="cq-empty">No subscribers found.</td>
              </tr>
            ) : (
              subscribers.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.email}</strong></td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: s.status === 'active' ? '#d1fae5' : '#fef3c7',
                      color: s.status === 'active' ? '#065f46' : '#92400e',
                    }}>
                      {s.status === 'active' ? 'Active' : 'Unsubscribed'}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px' }}>{formatDate(s.subscribedAt)}</td>
                  <td style={{ fontSize: '13px' }}>{s.unsubscribedAt ? formatDate(s.unsubscribedAt) : '—'}</td>
                  <td>
                    <button
                      onClick={() => setConfirmDelete(s.id)}
                      className="btn btn--outline btn--sm"
                      style={{ color: '#dc2626', borderColor: '#fecaca' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Subscriber"
        message="Are you sure you want to delete this subscriber? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => {
          const id = confirmDelete
          setConfirmDelete(null)
          handleDelete(id)
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  )
}
