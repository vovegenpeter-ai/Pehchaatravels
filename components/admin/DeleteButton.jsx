'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchJson } from '@/lib/fetchJson'
import ConfirmDialog from '@/components/admin/ConfirmDialog'

export default function DeleteButton({ endpoint, label = 'Delete', confirmText }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  const handleConfirmDelete = async () => {
    setShowConfirm(false)
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
      <button type="button" className="btn btn--danger btn--sm" onClick={() => setShowConfirm(true)} disabled={busy}>
        {busy ? 'Deleting...' : label}
      </button>
      <ConfirmDialog
        open={showConfirm}
        title="Confirm Delete"
        message={confirmText || 'Are you sure you want to delete this item? This cannot be undone.'}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  )
}
