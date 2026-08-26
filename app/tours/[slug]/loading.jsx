export default function TourDetailLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <section className="tour-detail-hero" style={{ background: '#2d3748', minHeight: 350 }}>
        <div className="tour-detail-hero__overlay">
          <div className="container">
            <div style={{ height: 48, width: '60%', maxWidth: 500, background: 'rgba(255,255,255,0.2)', borderRadius: 8, marginBottom: 12 }} />
            <div style={{ height: 28, width: 160, background: 'rgba(255,255,255,0.15)', borderRadius: 20 }} />
          </div>
        </div>
      </section>
      <style dangerouslySetInnerHTML={{ __html: '@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }' }} />
    </>
  )
}
