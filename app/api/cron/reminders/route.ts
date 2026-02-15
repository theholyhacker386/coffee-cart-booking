import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { sendPushToAssigned, sendPushToEligible } from '@/lib/send-push'

export async function GET(request: NextRequest) {
  try {
    // Security check: verify the cron secret
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (key !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceRoleClient()
    const now = new Date()
    let remindersSent = 0

    // Get tomorrow's date in YYYY-MM-DD format
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    // Get today's date in YYYY-MM-DD format
    const todayStr = now.toISOString().split('T')[0]

    // ── 1. Day-Before Reminders ──
    // Find bookings happening TOMORROW that haven't had a day-before reminder sent
    const { data: tomorrowBookings, error: tomorrowErr } = await supabase
      .from('cc_bookings')
      .select('id, customer_name, event_type, custom_event_type, event_date, assigned_employees, staffing')
      .eq('event_date', tomorrowStr)
      .eq('day_before_reminder_sent', false)
      .neq('status', 'completed')

    if (tomorrowErr) {
      console.error('Error fetching tomorrow bookings:', tomorrowErr)
    }

    if (tomorrowBookings && tomorrowBookings.length > 0) {
      for (const booking of tomorrowBookings) {
        const eventType = booking.custom_event_type || booking.event_type || 'Event'
        const assignedIds: string[] = booking.assigned_employees || []

        if (assignedIds.length > 0) {
          // Send only to assigned employees
          await sendPushToAssigned(
            assignedIds,
            'Reminder: Event Tomorrow!',
            `${booking.customer_name}'s ${eventType} is tomorrow! Call the shop to check if the prep list is ready.`,
            `/employee/event/${booking.id}`,
            'day-before-reminder'
          )
        } else {
          // No one assigned yet — send to all eligible employees as fallback
          await sendPushToEligible(
            'Reminder: Event Tomorrow!',
            `${booking.customer_name}'s ${eventType} is tomorrow! Call the shop to check if the prep list is ready.`,
            `/employee/event/${booking.id}`,
            'day-before-reminder',
            booking.staffing || 1
          )
        }

        // Mark reminder as sent
        await supabase
          .from('cc_bookings')
          .update({ day_before_reminder_sent: true })
          .eq('id', booking.id)

        remindersSent++
      }
    }

    // ── 2. Hour-Before Reminders ──
    // Find bookings happening TODAY that haven't had an hour-before reminder sent
    const { data: todayBookings, error: todayErr } = await supabase
      .from('cc_bookings')
      .select('id, customer_name, event_type, custom_event_type, event_start_time, travel_drive_minutes, assigned_employees, staffing')
      .eq('event_date', todayStr)
      .eq('hour_before_reminder_sent', false)
      .neq('status', 'completed')

    if (todayErr) {
      console.error('Error fetching today bookings:', todayErr)
    }

    if (todayBookings && todayBookings.length > 0) {
      for (const booking of todayBookings) {
        // Calculate "arrive at shop" time:
        // event_start_time - 30min setup - drive_time - 20min buffer
        const arriveAtShopTime = calculateArriveAtShopTime(
          booking.event_start_time,
          booking.travel_drive_minutes || 0,
          todayStr
        )

        if (!arriveAtShopTime) continue

        // Check if arrive_at_shop is between 30min and 90min from now
        const diffMs = arriveAtShopTime.getTime() - now.getTime()
        const diffMin = diffMs / (1000 * 60)

        if (diffMin >= 30 && diffMin <= 90) {
          const eventType = booking.custom_event_type || booking.event_type || 'Event'
          const assignedIds: string[] = booking.assigned_employees || []

          if (assignedIds.length > 0) {
            // Send only to assigned employees
            await sendPushToAssigned(
              assignedIds,
              'Clock In Soon!',
              `Clock in at the shop in about 1 hour for ${booking.customer_name}'s ${eventType}!`,
              `/employee/event/${booking.id}`,
              'hour-before-reminder'
            )
          } else {
            // No one assigned yet — send to all eligible employees as fallback
            await sendPushToEligible(
              'Clock In Soon!',
              `Clock in at the shop in about 1 hour for ${booking.customer_name}'s ${eventType}!`,
              `/employee/event/${booking.id}`,
              'hour-before-reminder',
              booking.staffing || 1
            )
          }

          // Mark reminder as sent
          await supabase
            .from('cc_bookings')
            .update({ hour_before_reminder_sent: true })
            .eq('id', booking.id)

          remindersSent++
        }
      }
    }

    return NextResponse.json({
      success: true,
      remindersSent,
      checkedAt: now.toISOString(),
    })
  } catch (error) {
    console.error('Cron reminders error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

/**
 * Calculate the time an employee should arrive at the shop.
 * Formula: event start time - 30min setup - drive time - 20min buffer
 */
function calculateArriveAtShopTime(
  eventStartTime: string,
  travelDriveMinutes: number,
  dateStr: string
): Date | null {
  try {
    // Parse the event start time (e.g., "2:00 PM", "10:00 AM")
    const timeMatch = eventStartTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
    if (!timeMatch) return null

    let hours = parseInt(timeMatch[1], 10)
    const minutes = parseInt(timeMatch[2], 10)
    const period = timeMatch[3].toUpperCase()

    if (period === 'PM' && hours !== 12) hours += 12
    if (period === 'AM' && hours === 12) hours = 0

    const eventTime = new Date(dateStr + 'T00:00:00')
    eventTime.setHours(hours, minutes, 0, 0)

    // Subtract: 30min setup + drive time + 20min buffer
    const totalMinutesBefore = 30 + travelDriveMinutes + 20
    const arriveTime = new Date(eventTime.getTime() - totalMinutesBefore * 60 * 1000)

    return arriveTime
  } catch {
    return null
  }
}
