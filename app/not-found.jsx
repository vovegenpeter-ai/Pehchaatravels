import LayoutShell from '@/components/LayoutShell';

export default function NotFound() {
  return (
    <LayoutShell>
      <section className="not-found-section" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h1 className="not-found-title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Page Not Found</h1>
        <p className="not-found-message" style={{ fontSize: '1.2rem', color: '#4b5563' }}>
          Oops! The page you are looking for doesn't exist or has been moved.
        </p>
        <a href="/" className="btn-view-all" style={{ marginTop: '2rem' }}>
          Go Home
        </a>
      </section>
    </LayoutShell>
  );
}
