import HotelForm from '@/components/admin/HotelForm'

export const dynamic = 'force-dynamic'

export default function NewHotelPage() {
  return (
    <>
      <div className="admin-header"><h1>Add New Hotel</h1></div>
      <HotelForm />
    </>
  )
}
