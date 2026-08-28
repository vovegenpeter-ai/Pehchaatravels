export default function LoadingSpinner({ message = 'Loading...', submessage = 'Making everything ready for you.' }) {
  return (
    <div className="loading-spinner-overlay">
      <div className="loading-spinner-card">
        <div className="loading-spinner-ring" />
        <p className="loading-spinner-title">{message}</p>
        {submessage && <p className="loading-spinner-sub">{submessage}</p>}
      </div>
    </div>
  )
}
