import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { EMPLOYEE_COOKIE_NAME, decodeSessionToken } from '@/lib/employee-auth'
import { createServiceRoleClient } from '@/lib/supabase/server'

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

    // Fetch all time entries for this booking
    const { data: entries, error } = await supabase
      .from('cc_time_entries')
      .select('*, cc_employees(name)')
      .eq('booking_id', id)
      .order('clock_in', { ascending: true })

    if (error) {
      console.error('Error fetching time entries:', error)
      return NextResponse.json({ error: 'Failed to fetch time entries' }, { status: 500 })
    }

    return NextResponse.json(entries || [])
  } catch (error) {
    console.error('Time entries GET error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(
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

    // Get employee ID from cc_employees using the session name/id
    const { data: employee, error: empError } = await supabase
      .from('cc_employees')
      .select('id')
      .eq('id', session.id)
      .single()

    if (empError || !employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    // Check if employee already has an open time entry for this booking
    const { data: openEntry, error: checkError } = await supabase
      .from('cc_time_entries')
      .select('id')
      .eq('booking_id', id)
      .eq('employee_id', employee.id)
      .is('clock_out', null)
      .maybeSingle()

    if (checkError) {
      console.error('Error checking open entry:', checkError)
      return NextResponse.json({ error: 'Failed to check time status' }, { status: 500 })
    }

    if (openEntry) {
      return NextResponse.json({ error: 'Already clocked in' }, { status: 400 })
    }

    // Insert new time entry with clock_in = now
    const { data: newEntry, error: insertError } = await supabase
      .from('cc_time_entries')
      .insert({
        booking_id: id,
        employee_id: employee.id,
        clock_in: new Date().toISOString(),
      })
      .select('*, cc_employees(name)')
      .single()

    if (insertError) {
      console.error('Error clocking in:', insertError)
      return NextResponse.json({ error: 'Failed to clock in' }, { status: 500 })
    }

    return NextResponse.json(newEntry)
  } catch (error) {
    console.error('Time entries POST error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function PATCH(
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

    // Get employee ID
    const { data: employee, error: empError } = await supabase
      .from('cc_employees')
      .select('id')
      .eq('id', session.id)
      .single()

    if (empError || !employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    // Find the open time entry for this employee and booking
    const { data: openEntry, error: findError } = await supabase
      .from('cc_time_entries')
      .select('id')
      .eq('booking_id', id)
      .eq('employee_id', employee.id)
      .is('clock_out', null)
      .maybeSingle()

    if (findError) {
      console.error('Error finding open entry:', findError)
      return NextResponse.json({ error: 'Failed to find time entry' }, { status: 500 })
    }

    if (!openEntry) {
      return NextResponse.json({ error: 'Not clocked in' }, { status: 400 })
    }

    // Update: set clock_out = now
    const { data: updatedEntry, error: updateError } = await supabase
      .from('cc_time_entries')
      .update({ clock_out: new Date().toISOString() })
      .eq('id', openEntry.id)
      .select('*, cc_employees(name)')
      .single()

    if (updateError) {
      console.error('Error clocking out:', updateError)
      return NextResponse.json({ error: 'Failed to clock out' }, { status: 500 })
    }

    return NextResponse.json(updatedEntry)
  } catch (error) {
    console.error('Time entries PATCH error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
