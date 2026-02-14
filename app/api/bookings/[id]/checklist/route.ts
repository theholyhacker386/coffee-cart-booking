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

    // Fetch all checklist items for this booking
    const { data: items, error } = await supabase
      .from('cc_checklist_items')
      .select('*')
      .eq('booking_id', id)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching checklist items:', error)
      return NextResponse.json({ error: 'Failed to fetch checklist' }, { status: 500 })
    }

    // Sort by phase priority (day_before first, then day_of, then restock), then by sort_order
    const phaseOrder: Record<string, number> = { day_before: 0, day_of: 1, restock: 2 }
    const sorted = (items || []).sort((a, b) => {
      const phaseA = phaseOrder[a.phase] ?? 99
      const phaseB = phaseOrder[b.phase] ?? 99
      if (phaseA !== phaseB) return phaseA - phaseB
      return (a.sort_order || 0) - (b.sort_order || 0)
    })

    return NextResponse.json(sorted)
  } catch (error) {
    console.error('Checklist API error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
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

    await params // ensure params is resolved
    const body = await request.json()
    const { itemId, completed } = body

    if (!itemId || typeof completed !== 'boolean') {
      return NextResponse.json({ error: 'Missing itemId or completed field' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    // Update the checklist item
    const updateData: Record<string, unknown> = {
      completed,
      completed_by: completed ? session.id : null,
      completed_at: completed ? new Date().toISOString() : null,
    }

    const { data: updatedItem, error } = await supabase
      .from('cc_checklist_items')
      .update(updateData)
      .eq('id', itemId)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating checklist item:', error)
      return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
    }

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error('Checklist PATCH error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
