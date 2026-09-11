import { NextResponse } from 'next/server'
import { loginUser, createSession } from '@/lib/auth'
import { verifyRecaptcha } from '@/lib/recaptcha'

export async function POST(request) {
  try {
    const { emailOrPhone, password, recaptchaToken } = await request.json()

    if (!emailOrPhone || !password) {
      return NextResponse.json({ error: 'Email/phone and password are required.' }, { status: 400 })
    }

    const captcha = await verifyRecaptcha(recaptchaToken)
    if (!captcha.success) {
      return NextResponse.json(
        { error: 'Captcha verification failed. Please complete the captcha and try again.' },
        { status: 400 },
      )
    }

    const user = await loginUser({ emailOrPhone, password })
    await createSession(user.id)

    return NextResponse.json({ user, message: 'Signed in successfully.' })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}
