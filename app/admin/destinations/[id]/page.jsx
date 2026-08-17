import DestinationForm from '@/components/admin/DestinationForm'

export default async function EditDestinationPage({ params }) {
  const { id } = await params
  return (
    <>
      <div className="admin-header"><h1>Edit Destination</h1></div>
      <DestinationForm destinationId={id} />
    </>
  )
}
