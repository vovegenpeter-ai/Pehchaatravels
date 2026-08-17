import HotelForm from '@/components/admin/HotelForm'

export const dynamic = 'force-dynamic'

export default async function EditHotelPage({ params }) {
  const { id } = await params
  return (
    <>
      <div className="admin-header"><h1>Edit Hotel</h1></div>
      <HotelForm hotelId={id} />
    </>
  )
}
