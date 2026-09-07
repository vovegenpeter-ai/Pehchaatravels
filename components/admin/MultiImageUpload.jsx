'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchJson } from '@/lib/fetchJson'
import { compressImage, formatFileSize } from '@/lib/compressImage'
import { imageUrl } from '@/lib/cloudinaryUrl'

/**
 * Multi-image upload field backed by Cloudinary.
 *
 * `value` is an array of plain URL strings (legacy records) and/or objects
 * of the shape `{ url, publicId }`. `onChange` always emits objects so the
 * parent form stores both URL and Cloudinary public ID per image.
 */
export default function MultiImageUpload({ label = 'Images', value = [], onChange }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [lightboxIndex, setLightboxIndex] = useState(-1)

  const images = Array.isArray(value) ? value : []
  const previews = images.map((img) => imageUrl(img))

  const addImages = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setError('')
    setUploading(true)
    try {
      const uploaded = []
      for (const file of files) {
        // Compress image before uploading to keep payload small
        let uploadFile = file
        if (file.size > 300 * 1024) {
          uploadFile = await compressImage(file)
        }
        const formData = new FormData()
        formData.append('file', uploadFile)
        const data = await fetchJson('/api/admin/upload', { method: 'POST', body: formData })
        uploaded.push({ url: data.url, publicId: data.publicId || null })
      }
      onChange([...images, ...uploaded])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  /* Replace one image with a freshly uploaded asset; the old asset is
     cleaned up server-side when the form is saved. */
  const replaceImage = async (e, index) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(true)
    try {
      let uploadFile = file
      if (file.size > 300 * 1024) {
        uploadFile = await compressImage(file)
      }
      const formData = new FormData()
      formData.append('file', uploadFile)
      const data = await fetchJson('/api/admin/upload', { method: 'POST', body: formData })
      const next = images.map((img, i) =>
        i === index ? { url: data.url, publicId: data.publicId || null } : img
      )
      onChange(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const removeImage = (index) => {
    const next = images.filter((_, i) => i !== index)
    onChange(next)
  }

  const moveImage = (from, to) => {
    if (to < 0 || to >= images.length) return
    const next = [...images]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    onChange(next)
  }

  const closeLightbox = useCallback(() => setLightboxIndex(-1), [])

  useEffect(() => {
    if (lightboxIndex < 0) return
    const handler = (e) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') setLightboxIndex((i) => (i > 0 ? i - 1 : images.length - 1))
      if (e.key === 'ArrowRight') setLightboxIndex((i) => (i < images.length - 1 ? i + 1 : 0))
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [lightboxIndex, images.length, closeLightbox])

  return (
    <div className="form-group form-group--full">
      <label>{label}</label>
      <div className="multi-image-upload">
        <label className="multi-image-upload__add-btn">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={addImages}
            disabled={uploading}
            style={{ display: 'none' }}
          />
          {uploading ? 'Uploading…' : '+ Add Images'}
        </label>

        {error && <span className="upload-error">{error}</span>}
        {uploading && <span className="upload-status">Uploading to Cloudinary…</span>}

        {images.length > 0 && (
          <div className="multi-image-upload__grid">
            {images.map((img, i) => {
              const src = previews[i]
              const isCloud = img && typeof img === 'object' && img.publicId
              return (
                <div key={`${src}-${i}`} className="multi-image-upload__item">
                  <img
                    src={src}
                    alt={`Image ${i + 1}`}
                    className="multi-image-upload__thumb"
                    onClick={() => setLightboxIndex(i)}
                    title="Click to preview"
                  />
                  {isCloud && (
                    <span className="multi-image-upload__cloud-badge" title={img.publicId}>☁</span>
                  )}
                  <div className="multi-image-upload__actions">
                    <button
                      type="button"
                      className="multi-image-upload__arrow"
                      onClick={() => moveImage(i, i - 1)}
                      disabled={i === 0 || uploading}
                      title="Move left"
                    >
                      ◀
                    </button>
                    <span className="multi-image-upload__badge">{i + 1}</span>
                    <button
                      type="button"
                      className="multi-image-upload__arrow"
                      onClick={() => moveImage(i, i + 1)}
                      disabled={i === images.length - 1 || uploading}
                      title="Move right"
                    >
                      ▶
                    </button>
                    <label className="multi-image-upload__replace" title="Replace image">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => replaceImage(e, i)}
                        disabled={uploading}
                        style={{ display: 'none' }}
                      />
                      ⟳
                    </label>
                    <button
                      type="button"
                      className="multi-image-upload__remove"
                      onClick={() => removeImage(i)}
                      disabled={uploading}
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex >= 0 && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}>&times;</button>
            <button
              className="lightbox-arrow lightbox-arrow--left"
              onClick={() => setLightboxIndex((i) => (i > 0 ? i - 1 : images.length - 1))}
            >
              ‹
            </button>
            <img src={previews[lightboxIndex]} alt={`Preview ${lightboxIndex + 1}`} className="lightbox-image" />
            <button
              className="lightbox-arrow lightbox-arrow--right"
              onClick={() => setLightboxIndex((i) => (i < images.length - 1 ? i + 1 : 0))}
            >
              ›
            </button>
            <div className="lightbox-counter">{lightboxIndex + 1} / {images.length}</div>
          </div>
        </div>
      )}
    </div>
  )
}