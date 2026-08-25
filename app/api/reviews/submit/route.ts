import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth-user'

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to submit a review' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, tourId, rating, comment, images } = body

    // Validate required fields
    if (!tourId || !rating || !comment) {
      return NextResponse.json({ error: 'Tour ID, rating, and comment are required' }, { status: 400 })
    }

    // Validate rating (supports 0.5 increments: 1, 1.5, 2, 2.5, etc.)
    const ratingNum = parseFloat(rating)
    if (isNaN(ratingNum) || ratingNum < 0.5 || ratingNum > 5 || ratingNum % 0.5 !== 0) {
      return NextResponse.json({ error: 'Rating must be between 0.5 and 5 in 0.5 increments' }, { status: 400 })
    }

    // Validate comment length
    if (comment.length < 10 || comment.length > 2000) {
      return NextResponse.json({ error: 'Comment must be between 10 and 2000 characters' }, { status: 400 })
    }

    // If orderId provided, validate it
    let resolvedOrderId = orderId || null
    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      })

      if (order && order.email === user.email) {
        resolvedOrderId = orderId
      }
    }

    // Check for duplicate review (same user + same tour)
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: user.id,
        tourId: tourId,
      },
    })

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this tour' }, { status: 400 })
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId: user.id,
        orderId: resolvedOrderId,
        tourId: tourId,
        rating: ratingNum,
        comment: comment.trim(),
        images: images || [],
        status: 'pending',
      },
    })

    return NextResponse.json({
      message: 'Thank you! Your review has been submitted and is awaiting approval.',
      review,
    })
  } catch (error) {
    console.error('[REVIEW SUBMIT ERROR]', error)
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }
}
