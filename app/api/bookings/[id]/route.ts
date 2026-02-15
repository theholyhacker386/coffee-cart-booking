import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { EMPLOYEE_COOKIE_NAME, decodeSessionToken } from '@/lib/employee-auth'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { sendPushToAssigned } from '@/lib/send-push'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    const supabase = createServiceRoleClient()

    const { data: booking, error } = await supabase
      .from('cc_bookings')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Booking detail API error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const body = await request.json()
    const { assigned_employees, total_sales } = body

    const supabase = createServiceRoleClient()

    // If total_sales is being updated (admin profit tracking)
    if (total_sales !== undefined) {
      const { data: updatedBooking, error: updateError } = await supabase
        .from('cc_bookings')
        .update({ total_sales: total_sales })
        .eq('id', id)
        .select('*')
        .single()

      if (updateError) {
        console.error('Error updating total_sales:', updateError)
        return NextResponse.json({ error: 'Failed to update total sales' }, { status: 500 })
      }

      return NextResponse.json(updatedBooking)
    }

    // If assigned_employees is being updated
    if (!Array.isArray(assigned_employees)) {
      return NextResponse.json({ error: 'assigned_employees must be an array' }, { status: 400 })
    }

    // Fetch current booking to know who was already assigned
    const { data: currentBooking } = await supabase
      .from('cc_bookings')
      .select('assigned_employees, event_type, custom_event_type, event_date')
      .eq('id', id)
      .single()

    if (!currentBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Update the assigned employees
    const { data: updatedBooking, error: updateError } = await supabase
      .from('cc_bookings')
      .update({ assigned_employees })
      .eq('id', id)
      .select('*')
      .single()

    if (updateError) {
      console.error('Error updating booking assignment:', updateError)
      return NextResponse.json({ error: 'Failed to update assignment' }, { status: 500 })
    }

    // Find newly assigned employees (not in the previous list)
    const previouslyAssigned: string[] = currentBooking.assigned_employees || []
    const newlyAssigned = assigned_employees.filter(
      (empId: string) => !previouslyAssigned.includes(empId)
    )

    // Send push notification to newly assigned employees
    if (newlyAssigned.length > 0) {
      try {
        const eventType = currentBooking.custom_event_type || currentBooking.event_type || 'Event'
        const dateFormatted = new Date(currentBooking.event_date + 'T12:00:00').toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })

        await sendPushToAssigned(
          newlyAssigned,
          'You\'ve Been Assigned!',
          `You've been assigned to ${eventType} on ${dateFormatted}`,
          `/employee/event/${id}`,
          'assignment'
        )
      } catch (pushError) {
        console.error('Error sending assignment push:', pushError)
      }
    }

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error('Booking PATCH error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
