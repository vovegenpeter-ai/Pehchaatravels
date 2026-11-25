import Link from 'next/link'

/**
 * 404 page.
 *
 * The root layout already wraps every route in <LayoutShell>, so this page
 * must NOT wrap itself again — doing so rendered the header and footer twice.
 */
export default function NotFound() {
  return (
    <section className="not-found-section" style={{ padding: '4rem 0', textAlign: 'center' }}>
      <h1 className="not-found-title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
        Page Not Found
      </h1>
      <p className="not-found-message" style={{ fontSize: '1.2rem', color: '#4b5563', maxWidth: 560, margin: '0 auto' }}>
        Oops! The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/" className="btn-view-all">
          Go Home
        </Link>
        <Link href="/tours" className="btn btn--outline">
          Browse Tour Packages
        </Link>
        <Link href="/places" className="btn btn--outline">
          Explore Places
        </Link>
      </div>
    </section>
  )
}
