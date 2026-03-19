import { NextResponse } from 'next/server'
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

    const payload = decodeSessionToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const supabase = createServiceRoleClient()

    const { data, error } = await supabase
      .from('cc_employees')
      .select('id, name')
      .order('name')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
