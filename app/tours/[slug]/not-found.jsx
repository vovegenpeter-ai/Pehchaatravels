import Link from 'next/link'

export default function TourNotFound() {
  return (
    <section className="section">
      <div className="container empty-state">
        <h1>Tour Not Found</h1>
        <p>The tour you are looking for does not exist or may have been removed.</p>
        <Link href="/tours" className="btn btn--primary btn--lg">Browse All Tours</Link>
      </div>
    </section>
  )
}
