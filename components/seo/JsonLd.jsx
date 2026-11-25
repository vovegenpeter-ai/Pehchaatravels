/**
 * Renders JSON-LD structured data.
 *
 * `data` may be a single object or an array of objects; multiple blocks are
 * emitted as separate <script> tags so each validates independently.
 */
export default function JsonLd({ data }) {
  const blocks = (Array.isArray(data) ? data : [data]).filter(Boolean)
  if (blocks.length === 0) return null

  return (
    <>
      {blocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
    </>
  )
}
