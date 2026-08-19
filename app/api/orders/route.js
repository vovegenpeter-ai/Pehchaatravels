import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
  try {
    const body = await request.json()
    const { fullName, email, phone, address, city, notes, items } = body

    if (!fullName || !email || !phone || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Full name, email, phone, and at least one item are required.' },
        { status: 400 }
      )
    }

    // Calculate total
    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    )

    // Create order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          fullName,
          email,
          phone,
          address: address || null,
          city: city || null,
          notes: notes || null,
          totalAmount,
          items: {
            create: items.map((item) => ({
              tourId: item.id,
              tourName: item.name,
              tourImage: item.image || null,
              price: Number(item.price),
              quantity: item.quantity,
            })),
          },
        },
        include: { items: true },
      })
      return newOrder
    })

    return NextResponse.json(
      { message: 'Booking submitted successfully.', order },
      { status: 201 }
    )
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create booking. Please try again.' },
      { status: 500 }
    )
  }
}
