import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendBookingConfirmationEmail } from '@/lib/mail'
import { TAX_RATE } from '@/lib/tourUtils'

export async function POST(request) {
  try {
    const body = await request.json()
    const { fullName, email, phone, address, city, notes, items, paymentMethod } = body

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

    // Calculate total (subtotal + service charges — must match checkout math)
    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    )
    const taxes = Math.round(subtotal * TAX_RATE)
    const totalAmount = subtotal + taxes

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
            bookingType: item.bookingType === 'COUPLE' ? 'COUPLE' : 'SINGLE',
          })),
        },
      },
      include: { items: true },
    })

    /* Record the payment intent so the admin sees it in Transactions. */
    const methodLabels = {
      BANK_TRANSFER: 'Bank Transfer',
      JAZZCASH: 'JazzCash',
      EASYPAISA: 'EasyPaisa',
      CASH: 'Cash on Arrival',
    }
    try {
      await prisma.transaction.create({
        data: {
          customerName: fullName,
          customerEmail: email,
          amount: totalAmount,
          status: 'Pending',
          method: methodLabels[paymentMethod] || 'Bank Transfer',
          order: { connect: { id: order.id } },
        },
      })
    } catch (txErr) {
      // Non-blocking — booking must not fail because of transaction logging
      console.error('[ORDER] Failed to create transaction record:', txErr)
    }

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
