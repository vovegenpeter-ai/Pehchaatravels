export default function LoadingSkeleton({ variant = 'default', message }) {
  const text = message || (
    variant === 'admin' ? 'Loading dashboard…' :
    variant === 'detail' ? 'Loading details…' :
    variant === 'form' ? 'Loading form…' :
    'Loading…'
  )

  const bg = variant === 'admin' ? '#f4f6f8' : '#ffffff'

  return (
    <div className="page-spinner-wrap" style={{ backgroundColor: bg }}>
      <div className="page-spinner" />
      <p className="page-spinner-text">{text}</p>
    </div>
  )
}
