import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { EMPLOYEE_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from './lib/employee-auth'

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

    // Auto-refresh: if more than 1 day has passed, issue a fresh token
    const oneDayMs = 24 * 60 * 60 * 1000
    const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000
    const timeRemaining = payload.exp - Date.now()

    if (timeRemaining < ninetyDaysMs - oneDayMs) {
      // Refresh the session by creating a new token with a fresh 90-day expiration
      const newExp = Date.now() + ninetyDaysMs
      const newPayload = JSON.stringify({
        id: payload.id,
        name: payload.name,
        role: payload.role || 'employee',
        exp: newExp,
      })
      const newToken = btoa(newPayload)

      const response = NextResponse.next()
      response.cookies.set(EMPLOYEE_COOKIE_NAME, newToken, SESSION_COOKIE_OPTIONS)
      return response
    }
  } catch {
    return NextResponse.redirect(new URL('/employee', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/employee/dashboard', '/employee/event/:path*', '/employee/admin/:path*', '/employee/settings/:path*'],
}
