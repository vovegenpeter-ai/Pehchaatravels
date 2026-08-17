import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const VALID_STATUSES = ['NEW', 'IN_PROGRESS', 'RESOLVED']

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
