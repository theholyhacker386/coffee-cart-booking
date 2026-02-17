import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { EMPLOYEE_COOKIE_NAME, decodeSessionToken } from '@/lib/employee-auth'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { sendPushToAll } from '@/lib/send-push'

// GET — fetch assignment statuses for a booking
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

    const { data: assignments, error } = await supabase
      .from('cc_event_assignments')
      .select('id, booking_id, employee_id, status, created_at')
      .eq('booking_id', id)

    if (error) {
      console.error('Error fetching assignments:', error)
      return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 })
    }

    // Also get employee names
    const employeeIds = (assignments || []).map(a => a.employee_id)
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

    const enriched = (assignments || []).map(a => ({
      ...a,
      employee_name: employeeNames[a.employee_id] || 'Unknown',
    }))

    return NextResponse.json(enriched)
  } catch (error) {
    console.error('Assignment GET error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// PATCH — employee accepts or declines an assignment
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(EMPLOYEE_COOKIE_NAME)?.value
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const session = decodeSessionToken(token)
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!['accepted', 'declined'].includes(status)) {
      return NextResponse.json({ error: 'Status must be accepted or declined' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    // Update the assignment for this employee
    const { data: updated, error } = await supabase
      .from('cc_event_assignments')
      .update({ status })
      .eq('booking_id', id)
      .eq('employee_id', session.id)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating assignment:', error)
      return NextResponse.json({ error: 'Failed to update assignment' }, { status: 500 })
    }

    // If declined, notify admin
    if (status === 'declined') {
      try {
        const { data: booking } = await supabase
          .from('cc_bookings')
          .select('event_type, custom_event_type, event_date')
          .eq('id', id)
          .single()

        if (booking) {
          const eventType = booking.custom_event_type || booking.event_type || 'Event'
          const dateFormatted = new Date(booking.event_date + 'T12:00:00').toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric',
          })

          await sendPushToAll(
            `${session.name} Declined`,
            `${session.name} declined ${eventType} on ${dateFormatted}`,
            `/employee/event/${id}`,
            'assignment-declined'
          )
        }
      } catch (pushError) {
        console.error('Error sending decline notification:', pushError)
      }
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Assignment PATCH error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
