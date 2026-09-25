'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchJson } from '@/lib/fetchJson'
import ConfirmDialog from '@/components/admin/ConfirmDialog'

const DELETE_TIMEOUT_MS = 30000

export default function DeleteButton({ endpoint, label = 'Delete', confirmText, disabled = false, onDeleted }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  const handleConfirmDelete = async () => {
    setShowConfirm(false)
    setBusy(true)
    setError('')
    try {
      await fetchJson(endpoint, { method: 'DELETE', timeoutMs: DELETE_TIMEOUT_MS })
      if (onDeleted) onDeleted()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setBusy(false)
      // Re-sync even if the request failed/timed out — the row may already be
      // gone server-side (e.g. deleted elsewhere), so never leave stale rows up.
      router.refresh()
    }
  }

  return (
    <>
      {error && <span className="admin-delete-error">{error}</span>}
      <button type="button" className="btn btn--danger btn--sm" onClick={() => setShowConfirm(true)} disabled={busy || disabled}>
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
