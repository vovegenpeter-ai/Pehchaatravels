import { NextResponse } from 'next/server'
import { loginUser, createSession } from '@/lib/auth'

export async function POST(request) {
  try {
    const { emailOrPhone, password } = await request.json()

    if (!emailOrPhone || !password) {
      return NextResponse.json({ error: 'Email/phone and password are required.' }, { status: 400 })
    }

    const user = await loginUser({ emailOrPhone, password })
    await createSession(user.id)

    return NextResponse.json({ user, message: 'Signed in successfully.' })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}
