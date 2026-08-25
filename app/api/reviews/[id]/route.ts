import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth-user'

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'You must be logged in' }, { status: 401 })
    }

    const { id } = await context.params
    const review = await prisma.review.findUnique({ where: { id } })

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    if (review.userId !== user.id) {
      return NextResponse.json({ error: 'You can only edit your own reviews' }, { status: 403 })
    }

    const body = await request.json()
    const { rating, comment } = body

    if (!rating || !comment) {
      return NextResponse.json({ error: 'Rating and comment are required' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    if (comment.length < 10 || comment.length > 2000) {
      return NextResponse.json({ error: 'Comment must be between 10 and 2000 characters' }, { status: 400 })
    }

    // Keep approved reviews as approved; only reset rejected/pending to pending
    const newStatus = review.status === 'approved' ? 'approved' : 'pending'

    const updated = await prisma.review.update({
      where: { id },
      data: {
        rating: parseInt(rating),
        comment: comment.trim(),
        status: newStatus,
      },
    })

    return NextResponse.json({ message: 'Review updated successfully', review: updated })
  } catch (error) {
    console.error('[REVIEW PATCH ERROR]', error)
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'You must be logged in' }, { status: 401 })
    }

    const { id } = await context.params
    const review = await prisma.review.findUnique({ where: { id } })

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    if (review.userId !== user.id) {
      return NextResponse.json({ error: 'You can only delete your own reviews' }, { status: 403 })
    }

    await prisma.review.delete({ where: { id } })

    return NextResponse.json({ message: 'Review deleted successfully' })
  } catch (error) {
    console.error('[REVIEW DELETE ERROR]', error)
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  }
}
