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
    const databaseUnavailable =
      error instanceof Error &&
      /server selection timeout|replicasetnoprimary|mongodb/i.test(error.message)

    if (databaseUnavailable) {
      return NextResponse.json(
        { error: 'The database is currently unavailable. Check the MongoDB Atlas connection and try again.' },
        { status: 503 },
      )
    }

    const message = formatZodError(error, 'Login failed')
    return NextResponse.json({ error: message }, { status: 401 })
  }
}
