import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { EMPLOYEE_COOKIE_NAME, decodeSessionToken } from '@/lib/employee-auth'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // Check for valid employee session
    const cookieStore = await cookies()
    const token = cookieStore.get(EMPLOYEE_COOKIE_NAME)?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const session = decodeSessionToken(token)
    if (!session) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 })
    }

    const supabase = createServiceRoleClient()

    // Check if roles should be included (for admin team management)
    const includeRole = request.nextUrl.searchParams.get('include_role') === 'true'
    const selectFields = includeRole ? 'id, name, role, created_at' : 'id, name'

    const { data: employees, error } = await supabase
      .from('cc_employees')
      .select(selectFields)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching employees:', error)
      return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 })
    }

    return NextResponse.json(employees || [])
  } catch (error) {
    console.error('Employees API error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
