import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { sendPushToAssigned, sendPushToEligible } from '@/lib/send-push'

/**
 * Format a Date as YYYY-MM-DD using its local (faked ET) values, NOT UTC.
 */
function formatDateLocal(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export async function GET(request: NextRequest) {
  try {
    // Security check: verify the cron secret
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (key !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceRoleClient()
    let remindersSent = 0

    // Use Eastern Time for all date/time calculations
    const nowET = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }))
    const currentHourET = nowET.getHours()

    // Get tomorrow's date in Eastern Time (YYYY-MM-DD format)
    const tomorrowET = new Date(nowET)
    tomorrowET.setDate(tomorrowET.getDate() + 1)
    const tomorrowStr = formatDateLocal(tomorrowET)

    // Get today's date in Eastern Time
    const todayStr = formatDateLocal(nowET)

    // ── 1. Day-Before Reminders ──
    // Only send between 7:00 AM and 7:59 AM Eastern Time
    if (currentHourET === 7) {
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
            await sendPushToAssigned(
              assignedIds,
              'Reminder: Event Tomorrow!',
              `${booking.customer_name}'s ${eventType} is tomorrow! Call the shop to check if the prep list is ready.`,
              `/employee/event/${booking.id}`,
              'day-before-reminder'
            )
          } else {
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
    }

    // ── 2. Hour-Before Reminders ──
    // Use Eastern Time for event time calculations too
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
        // Calculate "arrive at shop" time in Eastern Time:
        // event_start_time - 30min setup - drive_time - 20min buffer
        const arriveMinutesFromMidnight = calculateArriveMinutes(
          booking.event_start_time,
          booking.travel_drive_minutes || 0
        )

        if (arriveMinutesFromMidnight === null) continue

        // Current Eastern Time in minutes from midnight
        const nowMinutes = currentHourET * 60 + nowET.getMinutes()

        // How many minutes until they need to arrive at the shop
        const diffMin = arriveMinutesFromMidnight - nowMinutes

        if (diffMin >= 30 && diffMin <= 90) {
          const eventType = booking.custom_event_type || booking.event_type || 'Event'
          const assignedIds: string[] = booking.assigned_employees || []

          if (assignedIds.length > 0) {
            await sendPushToAssigned(
              assignedIds,
              'Clock In Soon!',
              `Clock in at the shop in about 1 hour for ${booking.customer_name}'s ${eventType}!`,
              `/employee/event/${booking.id}`,
              'hour-before-reminder'
            )
          } else {
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
      checkedAt: new Date().toISOString(),
      easternHour: currentHourET,
    })
  } catch (error) {
    console.error('Cron reminders error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

/**
 * Calculate the "arrive at shop" time as minutes from midnight (Eastern Time).
 * Formula: event start time - 30min setup - drive time - 20min buffer
 * Returns minutes from midnight, or null if parsing fails.
 */
function calculateArriveMinutes(
  eventStartTime: string,
  travelDriveMinutes: number
): number | null {
  try {
    const timeMatch = eventStartTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
    if (!timeMatch) return null

    let hours = parseInt(timeMatch[1], 10)
    const minutes = parseInt(timeMatch[2], 10)
    const period = timeMatch[3].toUpperCase()

    if (period === 'PM' && hours !== 12) hours += 12
    if (period === 'AM' && hours === 12) hours = 0

    const eventMinutes = hours * 60 + minutes
    const totalMinutesBefore = 30 + travelDriveMinutes + 20

    return eventMinutes - totalMinutesBefore
  } catch {
    return null
  }
}
