'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchJson } from '@/lib/fetchJson'

export default function DeleteButton({ endpoint, label = 'Delete', confirmText }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    const message = confirmText || 'Are you sure you want to delete this item? This cannot be undone.'
    if (!window.confirm(message)) return
    setBusy(true)
    setError('')
    try {
      await fetchJson(endpoint, { method: 'DELETE' })
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
      setBusy(false)
    }
  }

  return (
    <>
      {error && <span className="admin-delete-error">{error}</span>}
      <button type="button" className="btn btn--danger btn--sm" onClick={handleDelete} disabled={busy}>
        {busy ? 'Deleting...' : label}
      </button>
    </>
  )
}
