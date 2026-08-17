export default function FeatureCard({ icon, title, description }) {
  return (
    <article className="feature-card">
      <span className="feature-card__icon">{icon}</span>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  )
}
