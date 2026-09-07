import 'server-only'
import { v2 as cloudinary } from 'cloudinary'
import type { UploadApiResponse } from 'cloudinary'

/**
 * Server-only Cloudinary integration.
 *
 * The API secret is read from the server environment only — it is never
 * exposed to the browser. All uploads and deletions flow through Next.js
 * API routes (see app/api/admin/upload/route.ts).
 */

export interface CloudinaryImage {
  url: string
  publicId: string | null
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

function isConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  )
}

/** Upload a raw file buffer to Cloudinary and return the URL + public ID. */
export async function uploadImageBuffer(
  buffer: Buffer,
  { folder = 'pehchaan-travels' }: { folder?: string } = {}
): Promise<CloudinaryImage> {
  if (!isConfigured()) {
    throw new Error(
      'Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to your environment.'
    )
  }

  // Upload via stream so the raw Buffer is accepted with full type safety.
  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        // Store the plain URL; render-time transformations are applied via
        // lib/cloudinaryUrl.js (f_auto / q_auto / width resizing).
      },
      (error, uploadResult) => {
        if (error) reject(error)
        else if (uploadResult) resolve(uploadResult)
        else reject(new Error('Cloudinary upload returned no result'))
      }
    )
    stream.end(buffer)
  })

  return {
    url: result.secure_url || result.url,
    publicId: result.public_id || null,
  }
}

/**
 * Delete a Cloudinary asset by public ID.
 * Silently skips missing/empty public IDs and non-Cloudinary images.
 */
export async function deleteCloudinaryImage(publicId: string | null | undefined): Promise<void> {
  if (!publicId || !isConfigured()) return
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch {
    // Deletion is best-effort: an orphaned asset should never block a save.
  }
}

/** Delete a batch of Cloudinary assets by public ID. */
export async function deleteCloudinaryImages(
  publicIds: Array<string | null | undefined>
): Promise<void> {
  const unique = Array.from(new Set(publicIds.filter((id): id is string => Boolean(id))))
  await Promise.all(unique.map((id) => deleteCloudinaryImage(id)))
}

/** True when the URL points at Cloudinary (useful for cleanup decisions). */
export function isCloudinaryUrl(url: string | null | undefined): boolean {
  return typeof url === 'string' && url.includes('res.cloudinary.com')
}

/** Extract the public ID from a Cloudinary URL, or null when not applicable. */
export function extractPublicIdFromUrl(url: string | null | undefined): string | null {
  if (!isCloudinaryUrl(url)) return null
  try {
    // https://res.cloudinary.com/<cloud>/image/upload/v<version>/<publicId>
    const parts = url!.split('/image/upload/')
    if (parts.length < 2) return null
    let tail = parts[1]
    // Strip any transformation segments (e.g. "f_auto,q_auto/") and version
    const segments = tail.split('/').filter(Boolean)
    const last = segments[segments.length - 1]
    return last ? decodeURIComponent(last.split('.')[0]) : null
  } catch {
    return null
  }
}

/** Normalize an image value (URL string or { url, publicId }) into a stored entry. */
export function normalizeCloudImage(
  value: string | { url: string; publicId?: string | null } | null | undefined
): CloudinaryImage {
  if (!value) return { url: '', publicId: null }
  if (typeof value === 'string') {
    return { url: value, publicId: extractPublicIdFromUrl(value) }
  }
  return {
    url: value.url || '',
    publicId: value.publicId || extractPublicIdFromUrl(value.url) || null,
  }
}