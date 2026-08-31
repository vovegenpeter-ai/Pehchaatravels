import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/* PATCH — toggle blocked status */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    const user = await prisma.user.findUnique({ where: { id }, select: { blocked: true } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const updated = await prisma.user.update({
      where: { id },
      data: { blocked: !user.blocked },
      select: { id: true, blocked: true },
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('PATCH /api/admin/users/[id]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

/* DELETE — remove user permanently */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/admin/users/[id]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
