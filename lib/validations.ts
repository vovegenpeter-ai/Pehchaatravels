import { z } from 'zod'

const imageField = z.string().min(1).refine(
  (v) => v.startsWith('http') || v.startsWith('/'),
  'Must be a valid URL or upload path',
)

export const tourSchema = z.object({
  name: z.string().min(3),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  shortDescription: z.string().min(10),
  fullDescription: z.string().min(20),
  destination: z.string().min(2),
  location: z.string().optional(),
  price: z.number().positive(),
  duration: z.string().min(2),
  days: z.number().int().positive(),
  startDate: z.string().optional(),
  startTime: z.string().optional(),
  endDate: z.string().optional(),
  endTime: z.string().optional(),
  meetingPoint: z.string().optional(),
  itinerary: z.array(z.object({
    day: z.string(),
    time: z.string(),
    title: z.string(),
    activities: z.array(z.string()),
  })).optional(),
  includedServices: z.array(z.string()).default([]),
  excludedServices: z.array(z.string()).default([]),
  maxGuests: z.number().int().positive().optional(),
  rating: z.number().min(0).max(5).default(0),
  bannerImage: imageField,
  images: z.array(imageField).default([]),
  published: z.boolean().default(true),
  featured: z.boolean().default(false),
  latest: z.boolean().default(false),
  categoryId: z.string().optional().nullable(),
})

export const hotelSchema = z.object({
  name: z.string().min(3),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  shortDescription: z.string().min(10, 'Short description must be at least 10 characters'),
  fullDescription: z.string().min(20, 'Long description must be at least 20 characters'),
  description: z.string().optional().or(z.literal('')),
  location: z.string().min(2),
  address: z.string().optional(),
  pricePerNight: z.number().positive(),
  rating: z.number().min(0).max(5).default(0),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  amenities: z.array(z.string()).default([]),
  roomTypes: z.array(z.object({
    name: z.string(),
    price: z.number(),
    description: z.string().optional(),
  })).optional(),
  bannerImage: imageField,
  images: z.array(imageField).default([]),
  published: z.boolean().default(true),
  featured: z.boolean().default(false),
  categoryId: z.string().optional().nullable(),
})

export const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  type: z.enum(['TOUR', 'HOTEL', 'DESTINATION', 'ACTIVITY']),
  published: z.boolean().default(true),
  image: z.string().optional().or(z.literal('')),
})

export const destinationSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  shortDescription: z.string().min(10, 'Short description must be at least 10 characters'),
  fullDescription: z.string().min(20, 'Long description must be at least 20 characters'),
  description: z.string().optional().or(z.literal('')),
  location: z.string().min(2),
  image: imageField,
  published: z.boolean().default(true),
  featured: z.boolean().default(false),
  categoryId: z.string().optional().nullable(),
  tourIds: z.array(z.string()).default([]),
  hotelIds: z.array(z.string()).default([]),
})

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

/** Returns the affected field(s) when a Prisma unique-constraint (P2002) error occurs, else null. */
function prismaUniqueTarget(error: unknown): string | null {
  if (!error || typeof error !== 'object') return null
  const code = (error as { code?: unknown }).code
  if (code !== 'P2002') return null
  const meta = (error as { meta?: Record<string, unknown> }).meta
  const target = meta?.target
  if (typeof target === 'string') return target
  if (Array.isArray(target) && target.length > 0) return String(target[0])
  // Prisma 7 driver-adapter shape: { driverAdapterError: { cause: { constraint: { fields } } } }
  const driverMeta = meta?.driverAdapterError as
    | { cause?: { constraint?: { fields?: unknown } } }
    | undefined
  const fields = driverMeta?.cause?.constraint?.fields
  if (Array.isArray(fields) && fields.length > 0) return String(fields[0])
  return null
}

/**
 * Converts a Zod validation error into a single human-readable message
 * (e.g. "Description must be at least 20 characters long") instead of the
 * raw JSON issues array. Also turns common Prisma errors (unique
 * constraint violations) into friendly messages.
 */
export function formatZodError(error: unknown, fallback = 'Invalid input'): string {
  const uniqueField = prismaUniqueTarget(error)
  if (uniqueField) {
    const label = uniqueField.charAt(0).toUpperCase() + uniqueField.slice(1)
    return `${label} already exists — please use a different ${uniqueField}`
  }
  if (!(error instanceof z.ZodError)) {
    return error instanceof Error ? error.message : fallback
  }
  const issue = error.issues[0]
  if (!issue) return fallback

  const rawField = typeof issue.path[0] === 'string' ? issue.path[0] : 'value'
  const label = rawField
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())

  const anyIssue = issue as z.ZodIssue & {
    type?: string
    origin?: string
    minimum?: number
    maximum?: number
    received?: unknown
    format?: string
  }

  switch (anyIssue.code) {
    case 'too_small':
      if (anyIssue.origin === 'string') return `${label} must be at least ${anyIssue.minimum} characters long`
      if (anyIssue.origin === 'array') return `${label} must contain at least ${anyIssue.minimum} items`
      return `${label} must be at least ${anyIssue.minimum}`
    case 'too_big':
      if (anyIssue.origin === 'string') return `${label} must be at most ${anyIssue.maximum} characters`
      if (anyIssue.origin === 'array') return `${label} must contain at most ${anyIssue.maximum} items`
      return `${label} must be at most ${anyIssue.maximum}`
    case 'invalid_format':
      if (anyIssue.format === 'regex') return `${label} may only contain lowercase letters, numbers and hyphens`
      if (anyIssue.format === 'email') return `${label} must be a valid email address`
      return anyIssue.message
    case 'invalid_type':
      if (anyIssue.received === 'undefined') return `${label} is required`
      return anyIssue.message
    default:
      return `${label}: ${anyIssue.message}`
  }
}
