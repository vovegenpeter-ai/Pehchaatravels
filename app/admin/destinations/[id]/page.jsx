import DestinationForm from '@/components/admin/DestinationForm'

export const dynamic = 'force-dynamic'

export default async function EditDestinationPage({ params }) {
  const { id } = await params
  return (
    <>        <div className="admin-header"><h1>Edit Explore Places</h1></div>
      <DestinationForm destinationId={id} />
    </>
  )
}
