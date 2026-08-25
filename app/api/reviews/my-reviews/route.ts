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
