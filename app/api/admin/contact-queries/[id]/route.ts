import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const VALID_STATUSES = ['NEW', 'IN_PROGRESS', 'RESOLVED']

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const query = await prisma.contactMessage.findUnique({ where: { id } })
    if (!query) {
      return NextResponse.json({ error: 'Contact query not found.' }, { status: 404 })
    }

    await prisma.contactMessage.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete query'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!VALID_STATUSES.includes(body?.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { status: body.status },
    })

    return NextResponse.json(updated)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update query'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
