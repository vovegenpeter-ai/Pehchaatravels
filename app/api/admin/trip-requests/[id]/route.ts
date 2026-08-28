import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const tripRequest = await prisma.tripRequest.findUnique({ where: { id } })
  if (!tripRequest) {
    return NextResponse.json({ error: 'Trip request not found.' }, { status: 404 })
  }

  await prisma.tripRequest.delete({ where: { id } })

  return NextResponse.json({ success: true })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { status, adminNotes } = body

  const updated = await prisma.tripRequest.update({
    where: { id },
    data: {
      ...(status ? { status } : {}),
      ...(adminNotes !== undefined ? { adminNotes } : {}),
    },
  })

  return NextResponse.json(updated)
}
