import 'server-only'
import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { createUser, getUserByEmail, getUserByPhone } from '@/lib/db'
import { prisma } from '@/lib/prisma'

const USER_COOKIE = 'pehchaan_user_token'
const SESSION_DAYS = 7

function getSecret() {
  const secret = process.env.USER_JWT_SECRET || process.env.ADMIN_JWT_SECRET
  if (!secret) throw new Error('USER_JWT_SECRET or ADMIN_JWT_SECRET is not configured')
  return new TextEncoder().encode(secret)
}

function sanitizeUser(user: { id: string; fullName: string; email: string; phone: string }) {
  return { id: user.id, fullName: user.fullName, email: user.email, phone: user.phone }
}

export async function registerUser({
  fullName,
  email,
  phone,
  password,
}: {
  fullName: string
  email: string
  phone: string
  password: string
}) {
  if (await getUserByEmail(email)) {
    throw new Error('An account with this email already exists.')
  }
  if (await getUserByPhone(phone)) {
    throw new Error('An account with this phone number already exists.')
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await createUser({ fullName, email, phone, passwordHash })
  return sanitizeUser(user)
}

export async function loginUser({
  emailOrPhone,
  password,
}: {
  emailOrPhone: string
  password: string
}) {
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: emailOrPhone }, { phone: emailOrPhone }] },
  })
  if (!user) throw new Error('Invalid email/phone or password.')

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) throw new Error('Invalid email/phone or password.')

  return sanitizeUser(user)
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId, role: 'user' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSecret())

  const cookieStore = await cookies()
  cookieStore.set(USER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    path: '/',
  })

  return token
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete(USER_COOKIE)
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get(USER_COOKIE)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getSecret())
    const user = await prisma.user.findUnique({
      where: { id: payload.sub as string },
      select: { id: true, fullName: true, email: true, phone: true },
    })
    return user
  } catch {
    return null
  }
}
