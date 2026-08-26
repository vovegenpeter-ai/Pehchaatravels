'use client'

export default function LoadingSkeleton({ variant = 'default' }) {
  if (variant === 'detail') {
    return (
      <div className="loading-page-skeleton" style={{ backgroundColor: '#ffffff', minHeight: '85vh' }}>
        <section className="skeleton-hero" style={{ padding: '3.5rem 1.5rem', textAlign: 'left', backgroundColor: '#f8fafc' }}>
          <div className="container">
            <div className="skeleton-line skeleton-line--title" style={{ maxWidth: 480, margin: '0 0 1rem 0' }} />
            <div className="skeleton-pill" style={{ width: 120, height: 28 }} />
          </div>
        </section>
        <section className="skeleton-section" style={{ backgroundColor: '#ffffff' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              <div>
                <div className="skeleton-card__image" style={{ height: 380, borderRadius: 16, marginBottom: '1.5rem' }} />
                <div className="skeleton-line" style={{ height: 24, width: '40%', marginBottom: '1rem' }} />
                <div className="skeleton-line" style={{ height: 16, width: '100%', marginBottom: '0.5rem' }} />
                <div className="skeleton-line" style={{ height: 16, width: '90%', marginBottom: '0.5rem' }} />
                <div className="skeleton-line" style={{ height: 16, width: '75%', marginBottom: '1.5rem' }} />
              </div>
              <div>
                <div className="skeleton-card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
                  <div className="skeleton-line" style={{ height: 28, width: '60%', marginBottom: '1rem' }} />
                  <div className="skeleton-line" style={{ height: 44, width: '100%', borderRadius: 8, marginBottom: '1rem' }} />
                  <div className="skeleton-btn" style={{ width: '100%', height: 48 }} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (variant === 'form') {
    return (
      <div className="loading-page-skeleton" style={{ backgroundColor: '#ffffff', minHeight: '85vh' }}>
        <section className="skeleton-section" style={{ backgroundColor: '#ffffff', padding: '4rem 0' }}>
          <div className="container container--narrow">
            <div className="skeleton-card" style={{ padding: '2.5rem', backgroundColor: '#ffffff' }}>
              <div className="skeleton-line skeleton-line--section-title" style={{ margin: '0 auto 1rem', width: 200 }} />
              <div className="skeleton-line skeleton-line--section-subtitle" style={{ margin: '0 auto 2rem', width: 280 }} />
              <div className="skeleton-line" style={{ height: 48, width: '100%', borderRadius: 8, marginBottom: '1.25rem' }} />
              <div className="skeleton-line" style={{ height: 48, width: '100%', borderRadius: 8, marginBottom: '1.25rem' }} />
              <div className="skeleton-line" style={{ height: 100, width: '100%', borderRadius: 8, marginBottom: '1.5rem' }} />
              <div className="skeleton-btn" style={{ width: '100%', height: 48 }} />
            </div>
          </div>
        </section>
      </div>
    )
  }

  // Default / Grid skeleton
  return (
    <div className="loading-page-skeleton" style={{ backgroundColor: '#ffffff', minHeight: '85vh' }}>
      {/* Hero / Banner Skeleton */}
      <section className="skeleton-hero" style={{ backgroundColor: '#f8fafc' }}>
        <div className="container skeleton-hero__container">
          <div className="skeleton-line skeleton-line--title" />
          <div className="skeleton-line skeleton-line--subtitle" />
          <div className="skeleton-btn-group">
            <div className="skeleton-btn" />
            <div className="skeleton-btn skeleton-btn--secondary" />
          </div>
        </div>
      </section>

      {/* Grid Cards Skeleton */}
      <section className="skeleton-section" style={{ backgroundColor: '#ffffff' }}>
        <div className="container">
          <div className="skeleton-section__header">
            <div className="skeleton-line skeleton-line--section-title" />
            <div className="skeleton-line skeleton-line--section-subtitle" />
          </div>

          <div className="skeleton-grid">
            {[1, 2, 3].map((item) => (
              <div key={item} className="skeleton-card" style={{ backgroundColor: '#ffffff' }}>
                <div className="skeleton-card__image" />
                <div className="skeleton-card__body">
                  <div className="skeleton-card__header">
                    <div className="skeleton-line skeleton-line--card-title" />
                    <div className="skeleton-pill" />
                  </div>
                  <div className="skeleton-line skeleton-line--text" />
                  <div className="skeleton-line skeleton-line--text-short" />
                  <div className="skeleton-card__divider" />
                  <div className="skeleton-card__footer">
                    <div className="skeleton-price">
                      <div className="skeleton-line skeleton-line--label" />
                      <div className="skeleton-line skeleton-line--price" />
                    </div>
                    <div className="skeleton-card__btn" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
