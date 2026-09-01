'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchJson } from '@/lib/fetchJson'

export default function ImageUploadField({ label, value, onChange, name }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const data = await fetchJson('/api/admin/upload', { method: 'POST', body: formData })
      onChange({ target: { name, value: data.url } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const closeLightbox = useCallback(() => setLightboxOpen(false), [])

  useEffect(() => {
    if (!lightboxOpen) return
    const handler = (e) => { if (e.key === 'Escape') closeLightbox() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [lightboxOpen, closeLightbox])

  return (
    <div className="form-group form-group--full">
      <label>{label}</label>
      <div className="image-upload-field">
        <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} />
        {uploading && <span className="upload-status">Uploading...</span>}
        {error && <span className="upload-error">{error}</span>}
        {value && (
          <img
            src={value}
            alt="Preview"
            className="image-upload-preview image-upload-preview--clickable"
            onClick={() => setLightboxOpen(true)}
            title="Click to view full size"
          />
        )}
      </div>

      {lightboxOpen && value && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox} title="Close">&times;</button>
            <img src={value} alt="Full size preview" className="lightbox-image" />
          </div>
        </div>
      )}
    </div>
  )
}
