import JsonLd from './JsonLd'
import { breadcrumbSchema } from '@/lib/seo'

/**
 * Invisible BreadcrumbList structured data.
 *
 * Renders JSON-LD only — no visible markup — so search engines get hierarchy
 * signals without any change to the site's existing visual design.
 *
 * @param {{ items: { name: string, path?: string }[] }} props
 */
export default function Breadcrumbs({ items = [] }) {
  return <JsonLd data={breadcrumbSchema(items)} />
}
