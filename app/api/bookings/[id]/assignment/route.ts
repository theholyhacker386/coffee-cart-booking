import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { EMPLOYEE_COOKIE_NAME, decodeSessionToken } from '@/lib/employee-auth'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { sendPushToAdmins } from '@/lib/send-push'

// GET — fetch who's interested + who's assigned for a booking
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(EMPLOYEE_COOKIE_NAME)?.value
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const session = decodeSessionToken(token)
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 })

    const { id } = await params
    const supabase = createServiceRoleClient()

    const { data: interests, error } = await supabase
      .from('cc_event_assignments')
      .select('id, booking_id, employee_id, status, created_at')
      .eq('booking_id', id)

    if (error) {
      console.error('Error fetching interests:', error)
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
    }

    // Get employee names
    const employeeIds = (interests || []).map(a => a.employee_id)
    let employeeNames: Record<string, string> = {}

    if (employeeIds.length > 0) {
      const { data: employees } = await supabase
        .from('cc_employees')
        .select('id, name')
        .in('id', employeeIds)

      if (employees) {
        employeeNames = Object.fromEntries(employees.map(e => [e.id, e.name]))
      }
    }

    const enriched = (interests || []).map(a => ({
      ...a,
      employee_name: employeeNames[a.employee_id] || 'Unknown',
    }))

    return NextResponse.json(enriched)
  } catch (error) {
    console.error('Assignment GET error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// POST — employee expresses interest ("I want to work this")
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(EMPLOYEE_COOKIE_NAME)?.value
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const session = decodeSessionToken(token)
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 })

    const { id } = await params
    const supabase = createServiceRoleClient()

    // Insert interest record (upsert in case they already expressed interest)
    const { data: interest, error } = await supabase
      .from('cc_event_assignments')
      .upsert(
        { booking_id: id, employee_id: session.id, status: 'interested' },
        { onConflict: 'booking_id,employee_id' }
      )
      .select('*')
      .single()

    if (error) {
      console.error('Error expressing interest:', error)
      return NextResponse.json({ error: 'Failed to express interest' }, { status: 500 })
    }

    // Get the event details for the notification
    const { data: booking } = await supabase
      .from('cc_bookings')
      .select('event_type, custom_event_type, event_date, customer_name')
      .eq('id', id)
      .single()

    // Send push notification to all admins
    if (booking) {
      try {
        const eventType = booking.custom_event_type || booking.event_type || 'Event'
        const dateFormatted = new Date(booking.event_date + 'T12:00:00').toLocaleDateString('en-US', {
          weekday: 'short', month: 'short', day: 'numeric',
        })

        await sendPushToAdmins(
          `${session.name} Wants to Work!`,
          `${session.name} wants to work ${booking.customer_name}'s ${eventType} on ${dateFormatted}`,
          `/employee/event/${id}`,
          'interest-' + id
        )
      } catch (pushError) {
        console.error('Error sending admin notification:', pushError)
      }
    }

    return NextResponse.json(interest)
  } catch (error) {
    console.error('Interest POST error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// DELETE — employee withdraws interest
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(EMPLOYEE_COOKIE_NAME)?.value
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const session = decodeSessionToken(token)
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 })

    const { id } = await params
    const supabase = createServiceRoleClient()

    // Only allow withdrawing if not already assigned by admin
    const { data: existing } = await supabase
      .from('cc_event_assignments')
      .select('status')
      .eq('booking_id', id)
      .eq('employee_id', session.id)
      .single()

    if (existing?.status === 'assigned') {
      return NextResponse.json({ error: 'Cannot withdraw — you have been assigned by admin' }, { status: 400 })
    }

    await supabase
      .from('cc_event_assignments')
      .delete()
      .eq('booking_id', id)
      .eq('employee_id', session.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Interest DELETE error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
