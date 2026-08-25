import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''

    const where: any = {}

    if (status) {
      where.status = status
    }

    const newsletters = await prisma.newsletter.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(newsletters)
  } catch (error) {
    console.error('[ADMIN NEWSLETTERS ERROR]', error)
    return NextResponse.json({ error: 'Failed to load newsletters' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { subject, title, content, image, ctaText, ctaUrl, status } = body

    if (!subject || !title || !content) {
      return NextResponse.json({ error: 'Subject, title, and content are required' }, { status: 400 })
    }

    const newsletter = await prisma.newsletter.create({
      data: {
        subject,
        title,
        content,
        image: image || null,
        ctaText: ctaText || null,
        ctaUrl: ctaUrl || null,
        status: status || 'draft',
      },
    })

    return NextResponse.json(newsletter)
  } catch (error) {
    console.error('[ADMIN NEWSLETTER CREATE ERROR]', error)
    return NextResponse.json({ error: 'Failed to create newsletter' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, subject, title, content, image, ctaText, ctaUrl, status } = body

    if (!id) {
      return NextResponse.json({ error: 'Newsletter ID is required' }, { status: 400 })
    }

    const newsletter = await prisma.newsletter.update({
      where: { id },
      data: {
        ...(subject && { subject }),
        ...(title && { title }),
        ...(content && { content }),
        image: image !== undefined ? image : undefined,
        ctaText: ctaText !== undefined ? ctaText : undefined,
        ctaUrl: ctaUrl !== undefined ? ctaUrl : undefined,
        ...(status && { status }),
      },
    })

    return NextResponse.json(newsletter)
  } catch (error) {
    console.error('[ADMIN NEWSLETTER UPDATE ERROR]', error)
    return NextResponse.json({ error: 'Failed to update newsletter' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Newsletter ID is required' }, { status: 400 })
    }

    await prisma.newsletter.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Newsletter deleted successfully' })
  } catch (error) {
    console.error('[ADMIN NEWSLETTER DELETE ERROR]', error)
    return NextResponse.json({ error: 'Failed to delete newsletter' }, { status: 500 })
  }
}
