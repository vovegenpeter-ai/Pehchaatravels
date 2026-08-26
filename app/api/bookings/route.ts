import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth-user'

export async function GET(request: Request) {
  const user = await getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { email: user.email },
        { phone: user.phone },
      ],
    },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(orders)
}
