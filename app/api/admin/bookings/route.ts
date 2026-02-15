import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { EMPLOYEE_COOKIE_NAME, decodeSessionToken } from '@/lib/employee-auth'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { generateChecklist } from '@/lib/checklist-generator'
import { sendPushToAssigned } from '@/lib/send-push'

export async function POST(request: Request) {
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

    // Verify admin role from the database
    const supabase = createServiceRoleClient()
    const { data: employee } = await supabase
      .from('cc_employees')
      .select('role')
      .eq('id', session.id)
      .single()

    if (!employee || employee.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()

    const {
      event_type,
      custom_event_type,
      event_category,
      customer_name,
      phone,
      email,
      event_date,
      event_start_time,
      event_address,
      contact_name,
      contact_phone,
      drink_package,
      number_of_drinks,
      payment_method,
      extra_hours,
      indoor_outdoor,
      power_available,
      distance_from_power,
      sink_available,
      trash_on_site,
      travel_distance_miles,
      travel_drive_minutes,
      additional_details,
      assigned_employees,
      staffing,
      status,
    } = body

    // Build the booking record
    const bookingData: Record<string, unknown> = {
      event_type: event_type || 'Other',
      custom_event_type: custom_event_type || null,
      event_category: event_category || 'private',
      customer_name: customer_name || '',
      phone: phone || null,
      email: email || null,
      event_date,
      event_start_time: event_start_time || '10:00 AM',
      event_address: event_address || '',
      contact_name: contact_name || null,
      contact_phone: contact_phone || null,
      drink_package: drink_package || null,
      number_of_drinks: number_of_drinks || null,
      payment_method: payment_method || null,
      extra_hours: extra_hours || 0,
      indoor_outdoor: indoor_outdoor || 'outdoor',
      power_available: power_available || 'yes',
      distance_from_power: distance_from_power || null,
      sink_available: sink_available || 'no',
      trash_on_site: trash_on_site || 'no',
      travel_distance_miles: travel_distance_miles || 0,
      travel_drive_minutes: travel_drive_minutes || 0,
      additional_details: additional_details || null,
      assigned_employees: assigned_employees || [],
      staffing: staffing || 1,
      status: status || 'pending',
    }

    // Insert the booking
    const { data: booking, error: insertError } = await supabase
      .from('cc_bookings')
      .insert(bookingData)
      .select('*')
      .single()

    if (insertError) {
      console.error('Error creating booking:', insertError)
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
    }

    // Generate checklist items
    const checklistItems = generateChecklist({
      customer_name: booking.customer_name,
      event_date: booking.event_date,
      event_start_time: booking.event_start_time,
      event_address: booking.event_address,
      event_type: booking.event_type,
      custom_event_type: booking.custom_event_type,
      event_category: booking.event_category,
      indoor_outdoor: booking.indoor_outdoor,
      power_available: booking.power_available,
      distance_from_power: booking.distance_from_power,
      sink_available: booking.sink_available,
      trash_on_site: booking.trash_on_site,
      contact_name: booking.contact_name,
      contact_phone: booking.contact_phone,
      payment_method: booking.payment_method,
      drink_package: booking.drink_package,
      number_of_drinks: booking.number_of_drinks,
      extra_hours: booking.extra_hours,
      travel_distance_miles: booking.travel_distance_miles,
      travel_drive_minutes: booking.travel_drive_minutes,
      additional_details: booking.additional_details,
    })

    // Insert checklist items
    if (checklistItems.length > 0) {
      const checklistRows = checklistItems.map((item) => ({
        booking_id: booking.id,
        item_text: item.item_text,
        category: item.category,
        phase: item.phase,
        sort_order: item.sort_order,
        completed: false,
      }))

      const { error: checklistError } = await supabase
        .from('cc_checklist_items')
        .insert(checklistRows)

      if (checklistError) {
        console.error('Error inserting checklist items:', checklistError)
      }
    }

    // Send push notification to assigned employees
    if (assigned_employees && assigned_employees.length > 0) {
      try {
        const eventType = custom_event_type || event_type || 'Event'
        const dateFormatted = new Date(event_date + 'T12:00:00').toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })

        await sendPushToAssigned(
          assigned_employees,
          'New Event Assigned!',
          `New event assigned: ${eventType} on ${dateFormatted}`,
          `/employee/event/${booking.id}`,
          'assignment'
        )
      } catch (pushError) {
        console.error('Error sending push notification:', pushError)
      }
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Admin create booking error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
