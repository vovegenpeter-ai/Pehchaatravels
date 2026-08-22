import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendBookingConfirmationEmail } from '@/lib/mail'

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

    // Prevent duplicate bookings — check for an existing pending order with same email + items within last 2 minutes
    const recentCutoff = new Date(Date.now() - 2 * 60 * 1000)
    const existingOrder = await prisma.order.findFirst({
      where: {
        email,
        status: 'PENDING',
        createdAt: { gte: recentCutoff },
      },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    })

    if (existingOrder) {
      // Check if items match
      const sameItems =
        existingOrder.items.length === items.length &&
        existingOrder.items.every((ei) => items.some((i) => i.id === ei.tourId))
      if (sameItems) {
        return NextResponse.json(
          { message: 'Booking already exists.', order: existingOrder },
          { status: 201 }
        )
      }
    }

    // Calculate total
    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    )

    // Create order with items
    // Note: PrismaPg adapter does not support interactive $transaction(callback).
    // We use nested create which is atomic at the DB level.
    const order = await prisma.order.create({
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

    // Send confirmation email (non-blocking — don't fail the booking if email fails)
    sendBookingConfirmationEmail({
      to: email,
      name: fullName,
      orderId: order.id,
      tourNames: order.items.map((i) => i.tourName),
      totalAmount: Number(order.totalAmount),
      bookingDate: new Date(order.createdAt).toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      phone,
    }).catch((err) => console.error('[EMAIL] Booking confirmation email failed:', err))

    return NextResponse.json(
      { message: 'Booking submitted successfully.', order },
      { status: 201 }
    )
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: 'Failed to create booking. Please try again.' }, { status: 500 })
  }
}
