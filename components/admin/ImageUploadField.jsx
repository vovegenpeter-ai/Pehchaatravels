'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchJson } from '@/lib/fetchJson'
import { compressImage } from '@/lib/compressImage'
import { imageUrl } from '@/lib/cloudinaryUrl'

/**
 * Single image upload field backed by Cloudinary.
 *
 * `value` may be a plain URL string (legacy records) or an object of the
 * shape `{ url, publicId }`. `onChange` always emits `{ url, publicId }`
 * (or null when the image is removed), so the parent form can store both
 * the URL and the Cloudinary public ID.
 */
export default function ImageUploadField({ label, value, onChange, name }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const preview = imageUrl(value)
  const publicId = value && typeof value === 'object' ? value.publicId : null

  const emitValue = (next) => onChange({ target: { name, value: next } })

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(true)
    try {
      // Compress image before uploading to keep payload small
      let uploadFile = file
      if (file.size > 300 * 1024) {
        uploadFile = await compressImage(file)
      }
      const formData = new FormData()
      formData.append('file', uploadFile)
      const data = await fetchJson('/api/admin/upload', { method: 'POST', body: formData })
      // Replace the current image: swap the value with the newly uploaded asset.
      // The old Cloudinary asset is cleaned up server-side when the form is saved.
      emitValue({ url: data.url, publicId: data.publicId || null })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleRemove = () => {
    setError('')
    emitValue(null)
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
        {!preview ? (
          <label className="image-upload-field__picker">
            <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} />
            <span>{uploading ? 'Uploading…' : 'Choose Image'}</span>
          </label>
        ) : (
          <>
            <div className="image-upload-field__preview-wrap">
              <img
                src={preview}
                alt="Preview"
                className="image-upload-preview image-upload-preview--clickable"
                onClick={() => setLightboxOpen(true)}
                title="Click to view full size"
              />
              {publicId && (
                <span className="image-upload-field__badge" title={publicId}>
                  ☁ Cloudinary
                </span>
              )}
            </div>
            <div className="image-upload-field__actions">
              <label className="image-upload-field__replace-btn">
                <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} style={{ display: 'none' }} />
                {uploading ? 'Uploading…' : 'Replace Image'}
              </label>
              <button type="button" className="image-upload-field__remove-btn" onClick={handleRemove} disabled={uploading}>
                Remove
              </button>
            </div>
          </>
        )}
        {uploading && <span className="upload-status">Uploading to Cloudinary…</span>}
        {error && <span className="upload-error">{error}</span>}
      </div>

      {lightboxOpen && preview && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox} title="Close">&times;</button>
            <img src={preview} alt="Full size preview" className="lightbox-image" />
          </div>
        </div>
      )}
    </div>
  )
}