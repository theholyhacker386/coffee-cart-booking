import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { EMPLOYEE_COOKIE_NAME, decodeSessionToken } from '@/lib/employee-auth'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest) {
  try {
    // Check for valid admin session
    const cookieStore = await cookies()
    const token = cookieStore.get(EMPLOYEE_COOKIE_NAME)?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const session = decodeSessionToken(token)
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const supabase = createServiceRoleClient()

    // Verify the requester is an admin
    const { data: requester } = await supabase
      .from('cc_employees')
      .select('role')
      .eq('id', session.id)
      .single()

    if (!requester || requester.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { employeeId, role } = body

    if (!employeeId || !['admin', 'employee'].includes(role)) {
      return NextResponse.json({ error: 'Invalid employeeId or role' }, { status: 400 })
    }

    const { data: updated, error } = await supabase
      .from('cc_employees')
      .update({ role })
      .eq('id', employeeId)
      .select('id, name, role')
      .single()

    if (error) {
      console.error('Error updating employee role:', error)
      return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Role update error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
