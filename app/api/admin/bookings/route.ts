import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')?.trim() ?? ''
  const status = searchParams.get('status') ?? ''

  const orders = await prisma.order.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
              { id: { contains: search, mode: 'insensitive' } },
              { items: { some: { tourName: { contains: search, mode: 'insensitive' } } } },
            ],
          }
        : {}),
    },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(orders)
}
