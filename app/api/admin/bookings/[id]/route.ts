import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const order = await prisma.order.findUnique({ where: { id } })
  if (!order) {
    return NextResponse.json({ error: 'Booking not found.' }, { status: 404 })
  }

  // Manual cascade delete for MongoDB
  await prisma.orderItem.deleteMany({ where: { orderId: id } })
  await prisma.transaction.deleteMany({ where: { orderId: id } })
  await prisma.order.delete({ where: { id } })

  return NextResponse.json({ success: true })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { status } = body

  if (!status) {
    return NextResponse.json({ error: 'Status is required.' }, { status: 400 })
  }

  const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 })
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status },
    include: { items: true },
  })

  return NextResponse.json(updated)
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, transactions: true },
  })

  if (!order) {
    return NextResponse.json({ error: 'Booking not found.' }, { status: 404 })
  }

  return NextResponse.json(order)
}
