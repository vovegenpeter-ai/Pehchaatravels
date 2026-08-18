import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
  try {
    const { token, password } = await request.json()

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Reset token is required' }, { status: 400 })
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const resetRecord = await prisma.userPasswordResetToken.findUnique({
      where: { token },
    })

    if (!resetRecord) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 })
    }

    if (resetRecord.used) {
      return NextResponse.json({ error: 'This reset link has already been used' }, { status: 400 })
    }

    if (new Date() > resetRecord.expiresAt) {
      return NextResponse.json({ error: 'This reset link has expired' }, { status: 400 })
    }

    // Hash the new password and update the user
    const passwordHash = await bcrypt.hash(password, 10)

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash },
      }),
      prisma.userPasswordResetToken.update({
        where: { id: resetRecord.id },
        data: { used: true },
      }),
    ])

    return NextResponse.json({ message: 'Password has been reset successfully' })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
