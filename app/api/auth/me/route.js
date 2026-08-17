import { NextResponse } from 'next/server'
import { getCurrentUser, destroySession } from '@/lib/auth'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ user: null })
  return NextResponse.json({ user })
}

export async function DELETE() {
  await destroySession()
  return NextResponse.json({ message: 'Signed out successfully.' })
}
