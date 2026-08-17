import { NextResponse } from 'next/server'
import { getPublishedTours } from '@/lib/db'

export async function GET() {
  const tours = await getPublishedTours()
  return NextResponse.json(tours)
}
