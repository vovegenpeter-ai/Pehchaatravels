'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function NewsletterPage() {
  const [stats, setStats] = useState({
    totalSubscribers: 0,
    activeSubscribers: 0,
    unsubscribed: 0,
    newslettersSent: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [subscribersRes, newslettersRes] = await Promise.all([
          fetch('/api/admin/newsletter/subscribers'),
          fetch('/api/admin/newsletter'),
        ])

        const subscribers = subscribersRes.ok ? await subscribersRes.json() : []
        const newsletters = newslettersRes.ok ? await newslettersRes.json() : []

        setStats({
          totalSubscribers: subscribers.length,
          activeSubscribers: subscribers.filter((s) => s.status === 'active').length,
          unsubscribed: subscribers.filter((s) => s.status === 'unsubscribed').length,
          newslettersSent: newsletters.filter((n) => n.status === 'sent').length,
        })
      } catch (error) {
        console.error('Failed to fetch newsletter stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <>
      <div className="admin-header">
        <h1>Newsletter</h1>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#f0fdf4', padding: '1.5rem', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: '0.875rem', color: '#166534', marginBottom: '0.5rem' }}>Total Subscribers</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#14532d' }}>{loading ? '—' : stats.totalSubscribers}</div>
        </div>
        <div style={{ background: '#dbeafe', padding: '1.5rem', borderRadius: '12px', border: '1px solid #93c5fd' }}>
          <div style={{ fontSize: '0.875rem', color: '#1e40af', marginBottom: '0.5rem' }}>Active Subscribers</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1e3a8a' }}>{loading ? '—' : stats.activeSubscribers}</div>
        </div>
        <div style={{ background: '#fef3c7', padding: '1.5rem', borderRadius: '12px', border: '1px solid #fcd34d' }}>
          <div style={{ fontSize: '0.875rem', color: '#92400e', marginBottom: '0.5rem' }}>Unsubscribed</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#78350f' }}>{loading ? '—' : stats.unsubscribed}</div>
        </div>
        <div style={{ background: '#ede9fe', padding: '1.5rem', borderRadius: '12px', border: '1px solid #c4b5fd' }}>
          <div style={{ fontSize: '0.875rem', color: '#5b21b6', marginBottom: '0.5rem' }}>Newsletters Sent</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#4c1d95' }}>{loading ? '—' : stats.newslettersSent}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        <Link href="/admin/newsletter/subscribers" style={{ display: 'block', padding: '1.5rem', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', textDecoration: 'none', transition: 'box-shadow 0.2s' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1a4d3e', marginBottom: '0.5rem' }}>👥 Subscribers</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>View and manage newsletter subscribers</div>
        </Link>
        <Link href="/admin/newsletter/create" style={{ display: 'block', padding: '1.5rem', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', textDecoration: 'none', transition: 'box-shadow 0.2s' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1a4d3e', marginBottom: '0.5rem' }}>✏️ Create Newsletter</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Create and send a new newsletter</div>
        </Link>
        <Link href="/admin/newsletter/drafts" style={{ display: 'block', padding: '1.5rem', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', textDecoration: 'none', transition: 'box-shadow 0.2s' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1a4d3e', marginBottom: '0.5rem' }}>📝 Drafts</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>View and manage draft newsletters</div>
        </Link>
        <Link href="/admin/newsletter/sent" style={{ display: 'block', padding: '1.5rem', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', textDecoration: 'none', transition: 'box-shadow 0.2s' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1a4d3e', marginBottom: '0.5rem' }}>📤 Sent Newsletters</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>View history of sent newsletters</div>
        </Link>
      </div>
    </>
  )
}
