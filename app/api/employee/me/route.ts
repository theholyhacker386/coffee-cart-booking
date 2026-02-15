import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { EMPLOYEE_COOKIE_NAME, decodeSessionToken } from '@/lib/employee-auth'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(EMPLOYEE_COOKIE_NAME)?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const session = decodeSessionToken(token)

    if (!session) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 })
    }

    // Fetch the full employee record from the database so we can return preferences
    const supabase = createServiceRoleClient()
    const { data: employee } = await supabase
      .from('cc_employees')
      .select('id, name, notify_two_person_only')
      .eq('id', session.id)
      .single()

    if (employee) {
      return NextResponse.json({
        id: employee.id,
        name: employee.name,
        notifyTwoPersonOnly: employee.notify_two_person_only ?? false,
      })
    }

    // Fallback to session data if DB lookup fails
    return NextResponse.json({ id: session.id, name: session.name, notifyTwoPersonOnly: false })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(EMPLOYEE_COOKIE_NAME)?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const session = decodeSessionToken(token)

    if (!session) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 })
    }

    const body = await request.json()
    const { notifyTwoPersonOnly } = body

    const supabase = createServiceRoleClient()

    const { error } = await supabase
      .from('cc_employees')
      .update({ notify_two_person_only: notifyTwoPersonOnly ?? false })
      .eq('id', session.id)

    if (error) {
      console.error('Error updating employee preference:', error)
      return NextResponse.json({ error: 'Failed to update preference' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
