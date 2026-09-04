import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    const where: any = {}

    if (search) {
      where.email = { contains: search }
    }

    if (status) {
      where.status = status
    }

    const subscribers = await prisma.newsletterSubscriber.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(subscribers)
  } catch (error) {
    console.error('[ADMIN NEWSLETTER SUBSCRIBERS ERROR]', error)
    return NextResponse.json({ error: 'Failed to load subscribers' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Subscriber ID is required' }, { status: 400 })
    }

    await prisma.newsletterSubscriber.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Subscriber deleted successfully' })
  } catch (error) {
    console.error('[ADMIN NEWSLETTER SUBSCRIBER DELETE ERROR]', error)
    return NextResponse.json({ error: 'Failed to delete subscriber' }, { status: 500 })
  }
}
