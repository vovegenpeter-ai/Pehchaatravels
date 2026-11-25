'use client'

/**
 * Route-level error boundary.
 *
 * Without this, a transient database failure (e.g. the Atlas
 * "Server selection timeout: No available servers" blips) bubbles up to the
 * root layout and Next.js replaces the whole page with an unhandled runtime
 * error. Catching it here keeps the header/footer intact and gives the
 * visitor a working retry button instead of a dead page.
 */
export default function Error({ error, reset }) {
  const message = typeof error?.message === 'string' ? error.message : ''
  const isDbIssue =
    /server selection timeout|no available servers|prisma|raw query failed|econnrefused|etimedout/i.test(
      message
    )

  return (
    <section style={{ padding: '4rem 0', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--green)' }}>
        Something went wrong
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#4b5563', maxWidth: 560, margin: '0 auto' }}>
        {isDbIssue
          ? 'We could not reach our server just now. This is usually temporary — please try again in a moment.'
          : 'An unexpected error occurred while loading this page.'}
      </p>
      <div
        style={{
          marginTop: '2rem',
          display: 'flex',
          gap: '0.75rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <button type="button" onClick={() => reset()} className="btn-view-all">
          Try Again
        </button>
        <a href="/" className="btn btn--outline">
          Go Home
        </a>
      </div>
      {process.env.NODE_ENV === 'development' && message ? (
        <pre
          style={{
            marginTop: '2rem',
            maxWidth: 760,
            marginInline: 'auto',
            textAlign: 'left',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            background: '#f7fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: '1rem',
            fontSize: '0.8rem',
            color: '#4a5568',
          }}
        >
          {message}
        </pre>
      ) : null}
    </section>
  )
}
