export default function HomeLoading() {
  return (
    <div className="home-page-ref">
      {/* Hero skeleton */}
      <section className="hero-ref" style={{ background: '#2d3748' }}>
        <div className="hero-ref__overlay">
          <div className="container hero-ref__container">
            <div className="hero-ref__content">
              <div style={{ height: 64, width: '80%', maxWidth: 600, background: 'rgba(255,255,255,0.15)', borderRadius: 8, margin: '0 auto 24px' }} />
              <div style={{ height: 24, width: '70%', maxWidth: 500, background: 'rgba(255,255,255,0.1)', borderRadius: 6, margin: '0 auto 32px' }} />
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                <div style={{ height: 48, width: 160, background: 'rgba(255,255,255,0.15)', borderRadius: 8 }} />
                <div style={{ height: 48, width: 160, background: 'rgba(255,255,255,0.1)', borderRadius: 8 }} />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Tours skeleton */}
      <section className="best-tours-section">
        <div className="container">
          <div style={{ height: 36, width: 320, background: '#e2e8f0', borderRadius: 6, marginBottom: 24 }} />
          <div className="tour-cards-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
                <div style={{ height: 230, background: '#e2e8f0', animation: 'pulse 1.5s infinite' }} />
                <div style={{ padding: '1.35rem 1.5rem' }}>
                  <div style={{ height: 24, width: '70%', background: '#e2e8f0', borderRadius: 6, marginBottom: 8 }} />
                  <div style={{ height: 16, width: '100%', background: '#f1f5f9', borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <style dangerouslySetInnerHTML={{ __html: '@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }' }} />
    </div>
  )
}
