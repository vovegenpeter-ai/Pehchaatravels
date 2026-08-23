export default function ReviewCard({ review, dark }) {
  return (
    <article className={`review-card${dark ? ' review-card--dark' : ''}`}>
      <div className="review-card__header">
        <img src={review.avatar} alt={review.name} className="review-card__avatar" loading="lazy" />
        <div>
          <h4>{review.name}</h4>
          <span className="review-card__rating">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
        </div>
      </div>
      <p>&ldquo;{review.text}&rdquo;</p>
    </article>
  )
}
