import { jwtVerify } from 'jose'
import { prisma } from '@/lib/prisma'

const USER_COOKIE = 'pehchaan_user_token'

function getSecret() {
  const secret = process.env.USER_JWT_SECRET || process.env.ADMIN_JWT_SECRET
  if (!secret) throw new Error('USER_JWT_SECRET or ADMIN_JWT_SECRET is not configured')
  return new TextEncoder().encode(secret)
}

export async function getUserFromRequest(request: Request) {
  // Get cookies from request
  const cookieHeader = request.headers.get('cookie') || ''
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [key, ...val] = c.trim().split('=')
      return [key, val.join('=')]
    })
  )

  const token = cookies[USER_COOKIE]
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getSecret())
    const user = await prisma.user.findUnique({
      where: { id: payload.sub as string },
      select: { id: true, fullName: true, email: true, phone: true, avatar: true },
    })
    return user
  } catch {
    return null
  }
}
