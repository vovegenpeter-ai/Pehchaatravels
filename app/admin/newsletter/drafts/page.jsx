'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DraftsPage() {
  const router = useRouter()
  const [drafts, setDrafts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sendingId, setSendingId] = useState(null)

  const fetchDrafts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/newsletter?status=draft')
      if (!res.ok) throw new Error('Failed to load drafts')
      setDrafts(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load drafts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDrafts()
  }, [fetchDrafts])

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this draft?')) return
    try {
      const res = await fetch(`/api/admin/newsletter?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete draft')
      setDrafts((prev) => prev.filter((d) => d.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete draft')
    }
  }

  const handleSend = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to send this newsletter to all active subscribers?'
    )
    if (!confirmed) return

    setSendingId(id)
    try {
      const res = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsletterId: id }),
      })
      if (!res.ok) throw new Error('Failed to send newsletter')
      const result = await res.json()
      alert(result.message)
      fetchDrafts()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send newsletter')
    } finally {
      setSendingId(null)
    }
  }

  const formatDate = (iso) =>
    new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })

  return (
    <>
      <div className="admin-header">
        <h1>Newsletter Drafts</h1>
      </div>

      {error && <p className="cq-error">{error}</p>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Title</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="cq-empty">Loading drafts...</td>
              </tr>
            ) : drafts.length === 0 ? (
              <tr>
                <td colSpan="4" className="cq-empty">
                  No drafts found. <a href="/admin/newsletter/create">Create a new newsletter</a>
                </td>
              </tr>
            ) : (
              drafts.map((draft) => (
                <tr key={draft.id}>
                  <td><strong>{draft.subject}</strong></td>
                  <td>{draft.title}</td>
                  <td style={{ fontSize: '13px' }}>{formatDate(draft.createdAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleSend(draft.id)}
                        className="btn btn--primary btn--sm"
                        disabled={sendingId === draft.id}
                      >
                        {sendingId === draft.id ? 'Sending...' : 'Send'}
                      </button>
                      <button
                        onClick={() => handleDelete(draft.id)}
                        className="btn btn--outline btn--sm"
                        style={{ color: '#dc2626', borderColor: '#fecaca' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
