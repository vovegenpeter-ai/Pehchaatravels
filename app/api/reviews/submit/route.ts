import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper to get user from cookie/session
async function getUser(request: Request) {
  // Get cookies from request
  const cookieHeader = request.headers.get('cookie') || ''
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [key, ...val] = c.trim().split('=')
      return [key, val.join('=')]
    })
  )

  const sessionToken = cookies['user-session']
  if (!sessionToken) return null

  // Find user by session token (stored in UserPasswordResetToken with a special purpose)
  // For simplicity, we'll use a direct lookup
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: sessionToken,
      },
    })
    return user
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser(request)

    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to submit a review' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, tourId, rating, comment, images } = body

    // Validate required fields
    if (!orderId || !tourId || !rating || !comment) {
      return NextResponse.json({ error: 'Order ID, Tour ID, rating, and comment are required' }, { status: 400 })
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    // Validate comment length
    if (comment.length < 10 || comment.length > 2000) {
      return NextResponse.json({ error: 'Comment must be between 10 and 2000 characters' }, { status: 400 })
    }

    // Verify order exists and belongs to user
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.email !== user.email) {
      return NextResponse.json({ error: 'This order does not belong to you' }, { status: 403 })
    }

    // Verify order is completed
    if (order.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'You can only review completed bookings' }, { status: 400 })
    }

    // Verify tour is part of the order
    const orderItem = order.items.find((item) => item.tourId === tourId)
    if (!orderItem) {
      return NextResponse.json({ error: 'This tour is not part of your booking' }, { status: 400 })
    }

    // Check for duplicate review
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: user.id,
        orderId: orderId,
        tourId: tourId,
      },
    })

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this tour for this booking' }, { status: 400 })
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId: user.id,
        orderId: orderId,
        tourId: tourId,
        rating: parseInt(rating),
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
