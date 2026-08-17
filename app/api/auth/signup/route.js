import { NextResponse } from 'next/server'
import { registerUser, createSession } from '@/lib/auth'

export async function POST(request) {
  try {
    const { fullName, email, phone, password } = await request.json()

    if (!fullName || !email || !phone || !password) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 })
    }

    const user = await registerUser({ fullName, email, phone, password })
    await createSession(user.id)

    return NextResponse.json({ user, message: 'Account created successfully.' }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
