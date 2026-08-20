import { NextResponse } from 'next/server'
import { loginAdmin } from '@/lib/auth-admin'
import { adminLoginSchema, formatZodError } from '@/lib/validations'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = adminLoginSchema.parse(body)
    const admin = await loginAdmin(email, password)
    return NextResponse.json({ admin, message: 'Logged in successfully' })
  } catch (error) {
    const message = formatZodError(error, 'Login failed')
    return NextResponse.json({ error: message }, { status: 401 })
  }
}
