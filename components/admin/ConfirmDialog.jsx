'use client'

import { useEffect, useRef } from 'react'

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', cancelLabel = 'Cancel', onConfirm, onCancel, danger = true }) {
  const dialogRef = useRef(null)
  const cancelBtnRef = useRef(null)

  useEffect(() => {
    if (open && cancelBtnRef.current) {
      cancelBtnRef.current.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className="cd-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="cd-dialog" ref={dialogRef} role="alertdialog" aria-modal="true" aria-labelledby="cd-title" aria-describedby="cd-message">
        <div className="cd-icon-wrap">
          <div className={`cd-icon ${danger ? 'cd-icon--danger' : ''}`}>
            {danger ? '!' : '?'}
          </div>
        </div>
        <h3 className="cd-title" id="cd-title">{title}</h3>
        <p className="cd-message" id="cd-message">{message}</p>
        <div className="cd-actions">
          <button type="button" className="cd-btn cd-btn--cancel" ref={cancelBtnRef} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className={`cd-btn ${danger ? 'cd-btn--danger' : 'cd-btn--confirm'}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
