'use client'

import { useCallback, useEffect, useState } from 'react'
import AdminLoadingRow from '@/components/admin/AdminLoadingRow'

export default function SentNewslettersPage() {
  const [newsletters, setNewsletters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchNewsletters = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/newsletter?status=sent')
      if (!res.ok) throw new Error('Failed to load newsletters')
      setNewsletters(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load newsletters')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNewsletters()
  }, [fetchNewsletters])

  const formatDate = (iso) =>
    new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })

  return (
    <>
      <div className="admin-header">
        <h1>Sent Newsletters</h1>
      </div>

      {error && <p className="cq-error">{error}</p>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Title</th>
              <th>Recipients</th>
              <th>Sent At</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <AdminLoadingRow colSpan={5} />
            ) : newsletters.length === 0 ? (
              <tr>
                <td colSpan="5" className="cq-empty">No sent newsletters found.</td>
              </tr>
            ) : (
              newsletters.map((newsletter) => (
                <tr key={newsletter.id}>
                  <td><strong>{newsletter.subject}</strong></td>
                  <td>{newsletter.title}</td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                    }}>
                      {newsletter.recipientCount} recipients
                    </span>
                  </td>
                  <td style={{ fontSize: '13px' }}>{newsletter.sentAt ? formatDate(newsletter.sentAt) : '—'}</td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: newsletter.status === 'sent' ? '#d1fae5' : '#fef3c7',
                      color: newsletter.status === 'sent' ? '#065f46' : '#92400e',
                    }}>
                      {newsletter.status === 'sent' ? 'Sent' : newsletter.status}
                    </span>
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
