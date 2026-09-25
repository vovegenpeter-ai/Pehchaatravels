/**
 * Shared helpers for detecting and handling temporary (non-Cloudinary) images
 * inside rich-text HTML content.
 *
 * Images added through the rich-text editor are uploaded to Cloudinary and
 * stored as CDN URLs in the database. These helpers make sure nothing else —
 * base64 data URIs, blob: URLs, or file:// paths — can slip into saved content,
 * and let the editor migrate legacy embedded images automatically.
 */

/** Regex sources for every kind of temporary image URL. */
const TEMP_URI_SOURCES = [
  /data:image\/[^\s"')<>]+/g.source,
  /blob:[^\s"')<>]+/g.source,
  /file:\/\/\/?[^\s"')<>]+/g.source,
]

/** Matches any data:/blob:/file: URI inside HTML. */
export const TEMP_URI_REGEX = new RegExp(TEMP_URI_SOURCES.join('|'), 'g')

/** True for a single URI string (data:/blob:/file:). Safe for .test()-style checks. */
export function isTempUri(uri) {
  if (!uri) return false
  return uri.startsWith('data:image/') || uri.startsWith('blob:') || uri.startsWith('file:')
}

/* 1x1 transparent GIF used by the editor as an in-flight placeholder. Content
   carrying it (with data-rte-temp markers) is mid-migration and must not be
   re-migrated or saved. */
export const RTE_PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='

/**
 * True when `html` is legacy/unmigrated content: it contains embedded
 * temporary images but no in-flight editor placeholders. Used to trigger the
 * auto-migration exactly once, without looping on placeholder HTML.
 */
export function hasUnmigratedTempImages(html) {
  if (!html) return false
  if (html.includes('data-rte-temp=') || html.includes(RTE_PLACEHOLDER)) return false
  return hasTempImages(html)
}

/** Count of in-flight editor placeholders (uploads still running). */
export function countPendingUploads(html) {
  if (!html) return 0
  return (html.match(/data-rte-temp="/g) || []).length
}

/** True when the HTML contains at least one temporary image URI. */
export function hasTempImages(html) {
  if (!html) return false
  TEMP_URI_REGEX.lastIndex = 0
  return TEMP_URI_REGEX.test(html)
}

/** Count of temporary image URIs in the HTML. */
export function countTempImages(html) {
  if (!html) return 0
  TEMP_URI_REGEX.lastIndex = 0
  return (html.match(TEMP_URI_REGEX) || []).length
}

/**
 * Extract every temporary image URI from an HTML string (paste/drop payloads,
 * or legacy DB content) so each one can be uploaded to Cloudinary.
 */
export function extractTempImageUris(html) {
  if (!html) return []
  TEMP_URI_REGEX.lastIndex = 0
  const matches = html.match(TEMP_URI_REGEX) || []
  /* Trim trailing punctuation that regex classes may swallow inside text nodes */
  return matches.map((m) => m.replace(/[.,;:)]+$/, ''))
}

/** Small human label used in form error banners. */
export function tempImageWarning(count, label = 'description') {
  return (
    `The ${label} still contains ${count} image${count > 1 ? 's' : ''} that ` +
    'could not be uploaded to Cloudinary. Remove ' +
    `${count > 1 ? 'them' : 'it'} and insert again via the image button, paste or ` +
    'drag & drop — images upload to Cloudinary automatically, then save.'
  )
}

/** Message shown when a save is attempted while image uploads are running. */
export function pendingUploadsWarning(count, label = 'description') {
  return (
    `${count} image${count > 1 ? 's are' : ' is'} still uploading to Cloudinary. ` +
    `Please wait a few seconds and save the ${label} again.`
  )
}
