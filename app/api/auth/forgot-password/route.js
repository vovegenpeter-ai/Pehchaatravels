import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/mail'

const TOKEN_EXPIRY_HOURS = 1

export async function POST(request) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    // Always return generic success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: 'If an account with that email exists, a reset link has been sent.',
      })
    }

    // Invalidate any existing unused tokens for this user
    await prisma.userPasswordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    })

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)

    await prisma.userPasswordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt,
      },
    })

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://pehchaantravels.vercel.app')

    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`

    // Send the password reset email via SMTP
    const mailResult = await sendPasswordResetEmail({
      to: user.email,
      name: user.fullName,
      resetUrl,
    })

    return NextResponse.json({
      message: 'If an account with that email exists, a reset link has been sent.',
      ...(process.env.NODE_ENV !== 'production' && { resetUrl, mailResult }),
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
