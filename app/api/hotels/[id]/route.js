import { NextResponse } from 'next/server'
import { getHotelBySlugOrId } from '@/lib/db'

export async function GET(_request, { params }) {
  const { id } = await params
  const hotel = await getHotelBySlugOrId(id)
  if (!hotel) return NextResponse.json({ error: 'Hotel not found' }, { status: 404 })
  return NextResponse.json(hotel)
}
