export default function HotelsLoading() {
  return (
    <>
      <section className="page-hero" style={{ background: '#e2e8f0', minHeight: 320 }}>
        <div className="page-hero__overlay" style={{ background: 'linear-gradient(135deg, rgba(26,77,62,0.6), rgba(30,58,95,0.5))' }}>
          <div className="container">
            <div style={{ height: 48, width: 300, background: 'rgba(255,255,255,0.2)', borderRadius: 8, marginBottom: 12 }} />
            <div style={{ height: 24, width: 500, maxWidth: '100%', background: 'rgba(255,255,255,0.15)', borderRadius: 6 }} />
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ height: 32, width: 280, background: '#e2e8f0', borderRadius: 6, margin: '0 auto 12px' }} />
          </div>
          <div className="grid grid--3">
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <div style={{ height: 200, background: '#e2e8f0', animation: 'pulse 1.5s infinite' }} />
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ height: 22, width: '60%', background: '#e2e8f0', borderRadius: 6, marginBottom: 8 }} />
                  <div style={{ height: 14, width: '100%', background: '#f1f5f9', borderRadius: 4, marginBottom: 6 }} />
                  <div style={{ height: 14, width: '80%', background: '#f1f5f9', borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <style dangerouslySetInnerHTML={{ __html: '@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }' }} />
    </>
  )
}
