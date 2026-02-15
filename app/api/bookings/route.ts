import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { EMPLOYEE_COOKIE_NAME, decodeSessionToken } from '@/lib/employee-auth'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
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

    // Parse filter from query params
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'upcoming'
    const assignedOnly = searchParams.get('assigned') === 'true'

    const supabase = createServiceRoleClient()

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0]

    // Query bookings based on filter
    let bookingsQuery = supabase.from('cc_bookings').select('*')

    if (filter === 'past') {
      bookingsQuery = bookingsQuery
        .lt('event_date', today)
        .order('event_date', { ascending: false })
    } else {
      // Default to upcoming
      bookingsQuery = bookingsQuery
        .gte('event_date', today)
        .order('event_date', { ascending: true })
    }

    // Filter by assignment if requested
    if (assignedOnly && session) {
      bookingsQuery = bookingsQuery.contains('assigned_employees', [session.id])
    }

    const { data: bookings, error: bookingsError } = await bookingsQuery

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError)
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
    }

    if (!bookings || bookings.length === 0) {
      return NextResponse.json([])
    }

    // Get checklist counts for all bookings in one query
    const bookingIds = bookings.map(b => b.id)

    const { data: checklistItems, error: checklistError } = await supabase
      .from('cc_checklist_items')
      .select('booking_id, completed')
      .in('booking_id', bookingIds)

    if (checklistError) {
      console.error('Error fetching checklist items:', checklistError)
    }

    // Build a map of booking_id -> { total, completed }
    const checklistMap: Record<string, { total: number; completed: number }> = {}

    if (checklistItems) {
      for (const item of checklistItems) {
        if (!checklistMap[item.booking_id]) {
          checklistMap[item.booking_id] = { total: 0, completed: 0 }
        }
        checklistMap[item.booking_id].total += 1
        if (item.completed) {
          checklistMap[item.booking_id].completed += 1
        }
      }
    }

    // Merge checklist counts into bookings
    const bookingsWithProgress = bookings.map(booking => ({
      ...booking,
      checklist_total: checklistMap[booking.id]?.total ?? 0,
      checklist_completed: checklistMap[booking.id]?.completed ?? 0,
    }))

    return NextResponse.json(bookingsWithProgress)
  } catch (error) {
    console.error('Bookings API error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
