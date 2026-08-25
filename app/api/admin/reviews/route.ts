import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
    const tourId = searchParams.get('tourId') || ''

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (tourId) {
      where.tourId = tourId
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
        tour: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        order: {
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate statistics
    const allReviews = await prisma.review.findMany({
      select: { status: true, rating: true },
    })

    const stats = {
      total: allReviews.length,
      pending: allReviews.filter((r) => r.status === 'pending').length,
      approved: allReviews.filter((r) => r.status === 'approved').length,
      rejected: allReviews.filter((r) => r.status === 'rejected').length,
      averageRating: allReviews.length > 0
        ? Math.round((allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length) * 10) / 10
        : 0,
    }

    return NextResponse.json({ reviews, stats })
  } catch (error) {
    console.error('[ADMIN REVIEWS GET ERROR]', error)
    return NextResponse.json({ error: 'Failed to load reviews' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, status, adminResponse } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'Review ID and status are required' }, { status: 400 })
    }

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const review = await prisma.review.update({
      where: { id },
      data: {
        status,
        ...(adminResponse !== undefined && { adminResponse }),
      },
    })

    // If approved, update the tour's average rating
    if (status === 'approved') {
      const tourReviews = await prisma.review.findMany({
        where: { tourId: review.tourId, status: 'approved' },
        select: { rating: true },
      })

      const newAverage = tourReviews.length > 0
        ? tourReviews.reduce((sum, r) => sum + r.rating, 0) / tourReviews.length
        : 0

      await prisma.tour.update({
        where: { id: review.tourId },
        data: { rating: Math.round(newAverage * 10) / 10 },
      })
    }

    return NextResponse.json(review)
  } catch (error) {
    console.error('[ADMIN REVIEWS PATCH ERROR]', error)
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 })
    }

    // Get the review before deleting to update tour rating
    const review = await prisma.review.findUnique({
      where: { id },
    })

    if (review) {
      await prisma.review.delete({
        where: { id },
      })

      // Update tour's average rating
      const tourReviews = await prisma.review.findMany({
        where: { tourId: review.tourId, status: 'approved', id: { not: id } },
        select: { rating: true },
      })

      const newAverage = tourReviews.length > 0
        ? tourReviews.reduce((sum, r) => sum + r.rating, 0) / tourReviews.length
        : 0

      await prisma.tour.update({
        where: { id: review.tourId },
        data: { rating: Math.round(newAverage * 10) / 10 },
      })
    }

    return NextResponse.json({ message: 'Review deleted successfully' })
  } catch (error) {
    console.error('[ADMIN REVIEWS DELETE ERROR]', error)
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  }
}
