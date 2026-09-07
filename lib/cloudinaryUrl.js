/**
 * Client-safe Cloudinary helpers.
 *
 * These functions run in the browser (no secrets involved — only public
 * image URLs are manipulated).
 */

/**
 * Return the plain image URL from a value that may be a string URL or a
 * `{ url, publicId }` object (used by admin forms and API responses).
 */
export function imageUrl(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value.url) return value.url
  return ''
}

/**
 * Build an optimized Cloudinary URL by injecting transformation segments
 * (auto format, auto quality, optional width/height) into a plain
 * Cloudinary URL. Non-Cloudinary URLs (local /uploads paths, external
 * images) are returned untouched so existing images keep working.
 *
 * Example:
 *   https://res.cloudinary.com/demo/image/upload/v1/pehchaan/x.jpg
 *   → https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_800/v1/pehchaan/x.jpg
 */
export function cloudinaryImg(url, { width, height, quality = 'auto', format = 'auto' } = {}) {
  if (!url || typeof url !== 'string') return url
  if (!url.includes('res.cloudinary.com')) return url

  // Already transformed — don't double-inject.
  if (/\/image\/upload\/[^/]+,/.test(url) || /\/image\/upload\/(f_|q_|w_|h_|e_|c_)/.test(url)) {
    return url
  }

  const parts = []
  if (format === 'auto') parts.push('f_auto')
  if (quality === 'auto') parts.push('q_auto')
  if (width) parts.push(`w_${width}`)
  if (height) parts.push(`h_${height}`)
  if (parts.length === 0) return url

  return url.replace('/image/upload/', `/image/upload/${parts.join(',')}/`)
}

/** Optimize a background-image URL for CSS heroes (large width). */
export function cloudinaryBg(url, width = 1600) {
  return cloudinaryImg(url, { width })
}