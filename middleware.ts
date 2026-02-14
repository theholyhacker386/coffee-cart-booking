import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { EMPLOYEE_COOKIE_NAME } from './lib/employee-auth'

export function middleware(request: NextRequest) {
  const token = request.cookies.get(EMPLOYEE_COOKIE_NAME)?.value

  if (!token) {
    return NextResponse.redirect(new URL('/employee', request.url))
  }

  // Decode and validate the session token
  try {
    const payload = JSON.parse(atob(token))
    if (!payload.id || !payload.name || !payload.exp) {
      return NextResponse.redirect(new URL('/employee', request.url))
    }
    if (Date.now() > payload.exp) {
      return NextResponse.redirect(new URL('/employee', request.url))
    }
  } catch {
    return NextResponse.redirect(new URL('/employee', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/employee/dashboard', '/employee/event/:path*'],
}
