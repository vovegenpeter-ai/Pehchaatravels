import { NextResponse } from 'next/server'
import { addTripRequest } from '@/lib/db'

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, phone, destination, travelers, startDate, endDate } = body

    if (!name || !email || !phone || !destination || !travelers || !startDate || !endDate) {
      return NextResponse.json({ error: 'Required fields are missing.' }, { status: 400 })
    }

    const entry = await addTripRequest(body)
    return NextResponse.json(
      { message: 'Trip request submitted successfully.', id: entry.id },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
