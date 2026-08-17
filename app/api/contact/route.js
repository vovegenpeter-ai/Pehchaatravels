import { NextResponse } from 'next/server'
import { addContactMessage } from '@/lib/db'

export async function POST(request) {
  try {
    const { name, email, phone, subject, message } = await request.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Required fields are missing.' }, { status: 400 })
    }

    const entry = await addContactMessage({ name, email, phone, subject, message })
    return NextResponse.json({ message: 'Message sent successfully.', id: entry.id }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
