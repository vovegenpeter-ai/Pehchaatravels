import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper to get user from cookie/session
async function getUser(request: Request) {
  const cookieHeader = request.headers.get('cookie') || ''
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [key, ...val] = c.trim().split('=')
      return [key, val.join('=')]
    })
  )

  const sessionToken = cookies['user-session']
  if (!sessionToken) return null

  try {
    const user = await prisma.user.findFirst({
      where: { id: sessionToken },
    })
    return user
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  try {
    const user = await getUser(request)

    if (!user) {
      return NextResponse.json({ eligible: false, reason: 'Not logged in' })
    }

    const { searchParams } = new URL(request.url)
    const tourId = searchParams.get('tourId')

    if (!tourId) {
      return NextResponse.json({ eligible: false, reason: 'Tour ID is required' })
    }

    // Find completed orders for this user that include this tour
    const completedOrders = await prisma.order.findMany({
      where: {
        email: user.email,
        status: 'COMPLETED',
        items: {
          some: {
            tourId: tourId,
          },
        },
      },
      include: {
        items: true,
      },
    })

    if (completedOrders.length === 0) {
      return NextResponse.json({ eligible: false, reason: 'No completed booking found for this tour' })
    }

    // Check if user has already reviewed any of these orders for this tour
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: user.id,
        tourId: tourId,
      },
    })

    if (existingReview) {
      return NextResponse.json({
        eligible: false,
        reason: 'Review already submitted',
        reviewStatus: existingReview.status,
      })
    }

    return NextResponse.json({
      eligible: true,
      orders: completedOrders.map((o) => ({
        id: o.id,
        createdAt: o.createdAt,
      })),
    })
  } catch (error) {
    console.error('[REVIEW ELIGIBILITY ERROR]', error)
    return NextResponse.json({ eligible: false, reason: 'Failed to check eligibility' })
  }
}
