import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceRoleClient } from '@/lib/supabase/server'
import {
  hashPin,
  createSessionToken,
  EMPLOYEE_COOKIE_NAME,
  INVITE_CODE,
  SESSION_COOKIE_OPTIONS,
} from '@/lib/employee-auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, pin, inviteCode, notifyTwoPersonOnly } = body

    // Validate invite code
    if (inviteCode !== INVITE_CODE) {
      return NextResponse.json(
        { error: 'Invalid invite code' },
        { status: 403 }
      )
    }

    // Validate name
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Validate PIN is exactly 4 digits
    if (!pin || !/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { error: 'PIN must be exactly 4 digits' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()
    const trimmedName = name.trim()

    // Check for existing employee with same name (case-insensitive)
    const { data: existing } = await supabase
      .from('cc_employees')
      .select('id')
      .ilike('name', trimmedName)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'An employee with that name already exists' },
        { status: 400 }
      )
    }

    // Hash the PIN
    const pinHash = await hashPin(pin)

    // Insert the new employee
    const { data: employee, error: insertError } = await supabase
      .from('cc_employees')
      .insert({ name: trimmedName, pin_hash: pinHash, notify_two_person_only: notifyTwoPersonOnly || false })
      .select('id, name')
      .single()

    if (insertError) {
      console.error('Error creating employee:', insertError)
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
      )
    }

    // Set session cookie
    const token = createSessionToken(employee.id, employee.name)
    const cookieStore = await cookies()
    cookieStore.set(EMPLOYEE_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS)

    return NextResponse.json({
      success: true,
      employee: { id: employee.id, name: employee.name },
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
