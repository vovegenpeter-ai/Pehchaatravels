import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const ADMIN_COOKIE = 'pehchaan_admin_token'

async function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value
  if (!token || !process.env.ADMIN_JWT_SECRET) return false
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.ADMIN_JWT_SECRET))
    return true
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAdmin = await verifyAdmin(request)

  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    if (!isAdmin) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Public admin API routes that don't require authentication
  const publicAdminApis = ['/api/admin/auth/login', '/api/admin/auth/logout', '/api/admin/auth/me']
  const isPublicAdminApi = publicAdminApis.some((p) => pathname.startsWith(p))

  if (pathname.startsWith('/api/admin') && !isPublicAdminApi) {
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
