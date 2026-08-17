import { NextResponse } from 'next/server'
import { getTourBySlugOrId } from '@/lib/db'

export async function GET(_request, { params }) {
  const { id } = await params
  const tour = await getTourBySlugOrId(id)
  if (!tour) return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
  return NextResponse.json(tour)
}
