'use client'

import { useState, useEffect, useCallback } from 'react'

export default function ImageGallery({ images = [] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const validImages = images.filter(Boolean)
  if (validImages.length === 0) return null

  const go = useCallback((dir) => {
    setActiveIndex((i) => {
      const next = i + dir
      if (next < 0) return validImages.length - 1
      if (next >= validImages.length) return 0
      return next
    })
  }, [validImages.length])

  useEffect(() => {
    if (!lightboxOpen) return
    const handler = (e) => {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [lightboxOpen, go])

  return (
    <section className="tour-gallery">
      <div className="container">
        <h2 className="tour-section-title">Photo Gallery</h2>
        <div className="tour-gallery__grid">
          {validImages.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className={`tour-gallery__item ${i === activeIndex ? 'tour-gallery__item--active' : ''}`}
              onClick={() => { setActiveIndex(i); setLightboxOpen(true) }}
            >
              <img src={url} alt={`Tour photo ${i + 1}`} />
            </div>
          ))}
        </div>
      </div>

      {lightboxOpen && (
        <div className="tour-gallery__lightbox" onClick={() => setLightboxOpen(false)}>
          <div className="tour-gallery__lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button className="tour-gallery__lightbox-close" onClick={() => setLightboxOpen(false)}>&times;</button>
            <button className="tour-gallery__lightbox-arrow tour-gallery__lightbox-arrow--left" onClick={() => go(-1)}>‹</button>
            <img src={validImages[activeIndex]} alt={`Photo ${activeIndex + 1}`} className="tour-gallery__lightbox-img" />
            <button className="tour-gallery__lightbox-arrow tour-gallery__lightbox-arrow--right" onClick={() => go(1)}>›</button>
            <div className="tour-gallery__lightbox-counter">{activeIndex + 1} / {validImages.length}</div>
          </div>
        </div>
      )}
    </section>
  )
}
