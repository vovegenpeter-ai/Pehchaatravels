import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      avatar: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ user: fullUser })
}

export async function PUT(request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { fullName, email, phone, currentPassword, newPassword, avatar } = body

    // Fetch current user data
    const currentUser = await prisma.user.findUnique({ where: { id: user.id } })
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to set a new password' }, { status: 400 })
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 })
      }
      const valid = await bcrypt.compare(currentPassword, currentUser.passwordHash)
      if (!valid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      }
    }

    // Check email uniqueness if changed
    if (email && email.toLowerCase().trim() !== currentUser.email) {
      const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
      if (existing && existing.id !== user.id) {
        return NextResponse.json({ error: 'This email is already registered' }, { status: 400 })
      }
    }

    // Check phone uniqueness if changed
    if (phone && phone.trim() !== currentUser.phone) {
      const existing = await prisma.user.findUnique({ where: { phone: phone.trim() } })
      if (existing && existing.id !== user.id) {
        return NextResponse.json({ error: 'This phone number is already registered' }, { status: 400 })
      }
    }

    const updateData = {}
    if (fullName) updateData.fullName = fullName.trim()
    if (email) updateData.email = email.toLowerCase().trim()
    if (phone) updateData.phone = phone.trim()
    if (newPassword) updateData.passwordHash = await bcrypt.hash(newPassword, 10)

    // Handle avatar: accept base64 data URL or null to remove
    if (avatar !== undefined) {
      if (avatar === null || avatar === '') {
        updateData.avatar = null
      } else if (typeof avatar === 'string' && avatar.startsWith('data:image/')) {
        // Validate base64 image size (max ~500KB of base64 data)
        const base64Data = avatar.split(',')[1] || ''
        const sizeInBytes = Math.ceil((base64Data.length * 3) / 4)
        if (sizeInBytes > 500 * 1024) {
          return NextResponse.json({ error: 'Image is too large. Please use a smaller image.' }, { status: 400 })
        }
        updateData.avatar = avatar
      } else {
        return NextResponse.json({ error: 'Invalid image format' }, { status: 400 })
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        avatar: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ user: updatedUser, message: 'Profile updated successfully' })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
