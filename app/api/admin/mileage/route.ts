import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { EMPLOYEE_COOKIE_NAME, decodeSessionToken } from '@/lib/employee-auth'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(EMPLOYEE_COOKIE_NAME)?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const payload = decodeSessionToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!employeeId || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    // Get all bookings where this employee was assigned, within the date range
    const { data, error } = await supabase
      .from('cc_bookings')
      .select('id, event_date, customer_name, event_type, custom_event_type, travel_distance_miles')
      .gte('event_date', startDate)
      .lte('event_date', endDate)
      .contains('assigned_employees', [employeeId])
      .order('event_date', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
