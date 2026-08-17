import TourForm from '@/components/admin/TourForm'

export const dynamic = 'force-dynamic'

export default async function EditTourPage({ params }) {
  const { id } = await params
  return (
    <>
      <div className="admin-header"><h1>Edit Tour</h1></div>
      <TourForm tourId={id} />
    </>
  )
}
