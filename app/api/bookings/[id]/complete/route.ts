import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { Resend } from 'resend'
import { EMPLOYEE_COOKIE_NAME, decodeSessionToken } from '@/lib/employee-auth'
import { createServiceRoleClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)

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

    // Update booking status to completed
    const { error: updateError } = await supabase
      .from('cc_bookings')
      .update({ status: 'completed' })
      .eq('id', id)

    if (updateError) {
      console.error('Error completing booking:', updateError)
      return NextResponse.json({ error: 'Failed to complete booking' }, { status: 500 })
    }

    // Fetch the booking data for mileage calculation
    const { data: booking, error: fetchError } = await supabase
      .from('cc_bookings')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !booking) {
      console.error('Error fetching booking for email:', fetchError)
      return NextResponse.json({ error: 'Booking completed but email failed' }, { status: 500 })
    }

    // Calculate mileage based on staffing (1 or 2 employees)
    const staffing = booking.staffing || 1
    const oneWayMiles = booking.travel_distance_miles || 0
    const roundTripMiles = oneWayMiles * 2
    const perEmployeeMileage = roundTripMiles * 0.725
    const totalMileage = perEmployeeMileage * staffing

    // Format event date nicely
    const eventDate = new Date(booking.event_date + 'T12:00:00')
    const formattedDate = eventDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

    // Get event type display name
    const eventType = booking.custom_event_type || booking.event_type || 'Event'

    // Send mileage email to Jennifer
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Courier New', monospace;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background: #f9f9f9;
    }
    .container {
      background: #fff;
      padding: 30px;
      border-radius: 8px;
      border: 1px solid #ddd;
    }
    h2 {
      color: #6B4423;
      margin-top: 0;
    }
    .divider {
      color: #6B4423;
      font-weight: bold;
    }
    .total-line {
      font-weight: bold;
      font-size: 16px;
      color: #6B4423;
    }
    .note {
      color: #888;
      font-size: 13px;
      margin-top: 20px;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>MILEAGE REIMBURSEMENT SUMMARY</h2>
    <p class="divider">${'\u2501'.repeat(35)}</p>
    <p><strong>Event:</strong> ${booking.customer_name || 'Customer'}'s ${eventType} — ${formattedDate}</p>
    <p><strong>Round trip:</strong> ${roundTripMiles.toFixed(1)} miles</p>
    <br>
    <p>Employee 1: ${roundTripMiles.toFixed(1)} mi × $0.725 = $${perEmployeeMileage.toFixed(2)}</p>
    ${staffing === 2 ? `<p>Employee 2: ${roundTripMiles.toFixed(1)} mi × $0.725 = $${perEmployeeMileage.toFixed(2)}</p>` : ''}
    <p class="divider">${'\u2500'.repeat(35)}</p>
    <p class="total-line">Total mileage owed: $${totalMileage.toFixed(2)}</p>
    <p class="note">(This is separate from hourly wages handled through Square)</p>
  </div>
</body>
</html>
    `

    try {
      await resend.emails.send({
        from: 'The Porch Coffee Bar <onboarding@resend.dev>',
        to: 'shopcolby@gmail.com',
        subject: `Mileage Reimbursement — ${eventType} — ${formattedDate}`,
        html: emailHtml,
      })
      console.log('Mileage email sent to Jennifer')
    } catch (emailError) {
      console.error('Error sending mileage email:', emailError)
      // Don't fail the request — booking is already marked complete
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Complete booking API error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
