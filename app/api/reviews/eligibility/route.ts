import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth-user'

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ eligible: false, reason: 'Not logged in' })
    }

    const { searchParams } = new URL(request.url)
    const tourId = searchParams.get('tourId')

    if (!tourId) {
      return NextResponse.json({ eligible: false, reason: 'Tour ID is required' })
    }

    // Check if user has already reviewed this tour
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

    // Find any orders for this user that include this tour (for orderId reference)
    const orders = await prisma.order.findMany({
      where: {
        email: user.email,
        items: {
          some: {
            tourId: tourId,
          },
        },
      },
      include: {
        items: true,
      },
      take: 1,
    })

    return NextResponse.json({
      eligible: true,
      orders: orders.map((o) => ({
        id: o.id,
        createdAt: o.createdAt,
      })),
    })
  } catch (error) {
    console.error('[REVIEW ELIGIBILITY ERROR]', error)
    return NextResponse.json({ eligible: false, reason: 'Failed to check eligibility' })
  }
}
