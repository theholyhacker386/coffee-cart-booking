import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  decodeSessionToken,
  createSessionToken,
  EMPLOYEE_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
} from '@/lib/employee-auth'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'No token' }, { status: 401 })
    }

    // Decode and validate the saved token
    const payload = decodeSessionToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    // Verify the employee still exists in the database
    const supabase = createServiceRoleClient()
    const { data: employee } = await supabase
      .from('cc_employees')
      .select('id, name, role')
      .eq('id', payload.id)
      .single()

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 401 })
    }

    // Create a fresh token and set the cookie
    const newToken = createSessionToken(employee.id, employee.name, employee.role || 'employee')
    const cookieStore = await cookies()
    cookieStore.set(EMPLOYEE_COOKIE_NAME, newToken, SESSION_COOKIE_OPTIONS)

    return NextResponse.json({
      success: true,
      token: newToken,
    })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
