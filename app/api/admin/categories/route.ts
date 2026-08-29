import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { categorySchema, formatZodError } from '@/lib/validations'

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { children: { orderBy: { name: 'asc' } } },
  })
  return NextResponse.json(categories)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = categorySchema.parse(body)
    const category = await prisma.category.create({ data })
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    const message = formatZodError(error, 'Failed to create category')
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
