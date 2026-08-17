import TourForm from '@/components/admin/TourForm'

export const dynamic = 'force-dynamic'

export default function NewTourPage() {
  return (
    <>
      <div className="admin-header"><h1>Add New Tour</h1></div>
      <TourForm />
    </>
  )
}
