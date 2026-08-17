import { NextResponse } from 'next/server'
import { getPublishedHotels } from '@/lib/db'

export async function GET() {
  const hotels = await getPublishedHotels()
  return NextResponse.json(hotels)
}
