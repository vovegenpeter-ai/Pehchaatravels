import Link from 'next/link'
import { getDestinationPath } from '@/lib/pathUtils'

export default function PlaceCard({ place, dark }) {
  return (
    <article className={`card place-card${dark ? ' card--dark' : ''}`}>
      <div className="card__image">
        <img src={place.image} alt={place.name} loading="lazy" />
      </div>
      <div className="card__body">
        <h3>{place.name}</h3>
        <p>{place.shortDescription || place.description}</p>
        <Link href={getDestinationPath(place)} className="btn btn--primary btn--sm">Explore</Link>
      </div>
    </article>
  )
}
