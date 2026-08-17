export function PageHero({ title, subtitle, image }) {
  return (
    <section
      className="page-hero"
      style={image ? { backgroundImage: `url(${image})` } : undefined}
    >
      <div className="page-hero__overlay">
        <div className="container">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
    </section>
  )
}

export function SectionHeader({ title, description }) {
  return (
    <div className="section-header">
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  )
}

export function SuccessMessage({ message }) {
  return (
    <div className="success-banner">
      <span>✓ {message}</span>
    </div>
  )
}

export function ErrorBanner({ message }) {
  return <div className="error-banner">{message}</div>
}
