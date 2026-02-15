import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceRoleClient } from '@/lib/supabase/server'
import {
  verifyPin,
  createSessionToken,
  EMPLOYEE_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
} from '@/lib/employee-auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, pin } = body

    if (!name || !pin) {
      return NextResponse.json(
        { error: 'Invalid name or PIN' },
        { status: 401 }
      )
    }

    const supabase = createServiceRoleClient()

    // Look up employee by name (case-insensitive)
    const { data: employee } = await supabase
      .from('cc_employees')
      .select('id, name, pin_hash, role')
      .ilike('name', name.trim())
      .single()

    if (!employee) {
      return NextResponse.json(
        { error: 'Invalid name or PIN' },
        { status: 401 }
      )
    }

    // Verify PIN
    const pinValid = await verifyPin(pin, employee.pin_hash)
    if (!pinValid) {
      return NextResponse.json(
        { error: 'Invalid name or PIN' },
        { status: 401 }
      )
    }

    // Set session cookie (include role)
    const token = createSessionToken(employee.id, employee.name, employee.role || 'employee')
    const cookieStore = await cookies()
    cookieStore.set(EMPLOYEE_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS)

    return NextResponse.json({
      success: true,
      employee: { id: employee.id, name: employee.name },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
