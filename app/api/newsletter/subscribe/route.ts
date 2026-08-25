import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
    })

    if (existing) {
      if (existing.status === 'active') {
        return NextResponse.json({ message: 'You are already subscribed to our newsletter!' })
      }
      // Reactivate if previously unsubscribed
      await prisma.newsletterSubscriber.update({
        where: { email: normalizedEmail },
        data: { status: 'active', subscribedAt: new Date(), unsubscribedAt: null },
      })
      return NextResponse.json({ message: 'Welcome back! You have been resubscribed to our newsletter.' })
    }

    // Create new subscriber
    await prisma.newsletterSubscriber.create({
      data: { email: normalizedEmail },
    })

    return NextResponse.json({ message: 'Thank you for subscribing to our newsletter!' })
  } catch (error) {
    console.error('[NEWSLETTER SUBSCRIBE ERROR]', error)
    return NextResponse.json({ error: 'Failed to subscribe. Please try again.' }, { status: 500 })
  }
}
