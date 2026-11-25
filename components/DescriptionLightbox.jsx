'use client'

import { useCallback, useEffect, useState } from 'react'
import { cloudinaryImg } from '@/lib/cloudinaryUrl'

/**
 * Renders server-provided rich-text HTML (e.g. destination descriptions) and
 * lets any image inside it be clicked open in a fullscreen lightbox.
 * Reuses the existing `.tour-gallery__lightbox*` styles from globals.css.
 */
export default function DescriptionLightbox({ html, className = '' }) {
  const [zoom, setZoom] = useState(null)

  const close = useCallback(() => setZoom(null), [])

  const handleImageClick = (e) => {
    const target = e.target
    if (!target || target.tagName !== 'IMG') return
    // Keep an image wrapped in a link from navigating while zoomed.
    e.preventDefault()
    setZoom({
      src: cloudinaryImg(target.currentSrc || target.src, { width: 1600 }),
      alt: target.alt || '',
    })
  }

  useEffect(() => {
    if (!zoom) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [zoom, close])

  return (
    <>
      <div
        className={className}
        onClick={handleImageClick}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {zoom && (
        <div
          className="tour-gallery__lightbox"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          <div
            className="tour-gallery__lightbox-inner"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="tour-gallery__lightbox-close"
              onClick={close}
              aria-label="Close image preview"
            >
              &times;
            </button>
            <img src={zoom.src} alt={zoom.alt} className="tour-gallery__lightbox-img" />
          </div>
        </div>
      )}
    </>
  )
}
