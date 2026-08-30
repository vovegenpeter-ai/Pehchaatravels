import DestinationForm from '@/components/admin/DestinationForm'

export const dynamic = 'force-dynamic'

export default function NewDestinationPage() {
  return (
    <>        <div className="admin-header"><h1>Add Explore Places</h1></div>
      <DestinationForm />
    </>
  )
}
