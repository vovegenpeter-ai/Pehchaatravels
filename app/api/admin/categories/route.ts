import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { categorySchema, formatZodError } from '@/lib/validations'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  const where = type ? { type: type as never } : {}
  const categories = await prisma.category.findMany({ where })
  // Sort: custom order (orderNumber > 0) first ascending, then unordered (0) by newest
  categories.sort((a, b) => {
    const aOrder = (a.orderNumber ?? 0) > 0 ? a.orderNumber : Infinity
    const bOrder = (b.orderNumber ?? 0) > 0 ? b.orderNumber : Infinity
    if (aOrder !== bOrder) return aOrder - bOrder
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
  return NextResponse.json(categories)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = categorySchema.parse(body)
    const category = await prisma.category.create({ data })
    Promise.resolve().then(() => { revalidatePath('/'); revalidatePath('/places') })
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    const message = formatZodError(error, 'Failed to create category')
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
