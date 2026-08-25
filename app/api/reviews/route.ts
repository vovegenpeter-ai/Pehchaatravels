import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tourId = searchParams.get('tourId')
    const sortBy = searchParams.get('sortBy') || 'recent'
    const rating = searchParams.get('rating')

    if (!tourId) {
      return NextResponse.json({ error: 'Tour ID is required' }, { status: 400 })
    }

    const where: any = {
      tourId,
      status: 'approved',
    }

    if (rating) {
      where.rating = parseInt(rating)
    }

    let orderBy: any = { createdAt: 'desc' }
    if (sortBy === 'highest') orderBy = { rating: 'desc' }
    if (sortBy === 'lowest') orderBy = { rating: 'asc' }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
      },
      orderBy,
    })

    // Calculate rating summary
    const allApprovedReviews = await prisma.review.findMany({
      where: { tourId, status: 'approved' },
      select: { rating: true },
    })

    const totalReviews = allApprovedReviews.length
    const averageRating = totalReviews > 0
      ? allApprovedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    allApprovedReviews.forEach((r) => {
      ratingDistribution[r.rating as keyof typeof ratingDistribution]++
    })

    return NextResponse.json({
      reviews,
      summary: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        ratingDistribution,
      },
    })
  } catch (error) {
    console.error('[REVIEWS GET ERROR]', error)
    return NextResponse.json({ error: 'Failed to load reviews' }, { status: 500 })
  }
}
