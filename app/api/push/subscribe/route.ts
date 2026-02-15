import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { EMPLOYEE_COOKIE_NAME, decodeSessionToken } from '@/lib/employee-auth'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
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

    const { subscription } = await request.json()

    if (!subscription) {
      return NextResponse.json({ error: 'Missing subscription' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    // Delete any existing subscription for this employee (upsert behavior)
    await supabase
      .from('cc_push_subscriptions')
      .delete()
      .eq('employee_id', session.id)

    // Insert the new subscription
    const { error } = await supabase
      .from('cc_push_subscriptions')
      .insert({
        employee_id: session.id,
        subscription,
      })

    if (error) {
      console.error('Error saving push subscription:', error)
      return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Push subscribe error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
