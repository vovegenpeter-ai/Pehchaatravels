export default function FeatureCard({ icon, title, description, dark }) {
  return (
    <article className={`feature-card${dark ? ' feature-card--dark' : ''}`}>
      <span className="feature-card__icon">{icon}</span>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  )
}
