import 'server-only'
import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

const ADMIN_COOKIE = 'pehchaan_admin_token'
const SESSION_HOURS = 12

function getSecret() {
  const secret = process.env.ADMIN_JWT_SECRET
  if (!secret) throw new Error('ADMIN_JWT_SECRET is not configured')
  return new TextEncoder().encode(secret)
}

export async function loginAdmin(email: string, password: string) {
  const admin = await prisma.admin.findUnique({ where: { email } })
  if (!admin) throw new Error('Invalid email or password')

  const valid = await bcrypt.compare(password, admin.passwordHash)
  if (!valid) throw new Error('Invalid email or password')

  const token = await new SignJWT({ sub: admin.id, email: admin.email, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(getSecret())

  const cookieStore = await cookies()
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_HOURS * 60 * 60,
    path: '/',
  })

  return { id: admin.id, email: admin.email, name: admin.name }
}

export async function logoutAdmin() {
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
}

export async function getAdminSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getSecret())
    const admin = await prisma.admin.findUnique({
      where: { id: payload.sub as string },
      select: { id: true, email: true, name: true },
    })
    return admin
  } catch {
    return null
  }
}

export async function requireAdmin() {
  const admin = await getAdminSession()
  if (!admin) throw new Error('Unauthorized')
  return admin
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}
