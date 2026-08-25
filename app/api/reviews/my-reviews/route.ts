import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth-user'

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: 'You must be logged in' }, { status: 401 })
    }

    const reviews = await prisma.review.findMany({
      where: { userId: user.id },
      include: {
        tour: {
          select: {
            id: true,
            name: true,
            slug: true,
            bannerImage: true,
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

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('[MY REVIEWS ERROR]', error)
    return NextResponse.json({ error: 'Failed to load reviews' }, { status: 500 })
  }
}
