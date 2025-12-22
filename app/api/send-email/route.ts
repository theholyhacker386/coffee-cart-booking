import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import twilio from 'twilio'

const resend = new Resend(process.env.RESEND_API_KEY)

// Twilio setup for SMS
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null

// Jennifer's contact info
const JENNIFER_PHONE = '+13868826560'
const JENNIFER_EMAIL = 'shopcolby@gmail.com' // Must match Resend signup email on free tier

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customerName,
      email,
      phone,
      eventDate,
      eventAddress,
      eventType,
      eventCategory,
      estimatedPeople,
      eventStartTime,
      powerAvailable,
      distanceFromPower,
      indoorOutdoor,
      sinkAvailable,
      trashOnSite,
      contactName,
      contactPhone,
      drinkPackage,
      numberOfDrinks,
      extraHours,
      paymentMethod,
      drinkLimit,
      totalEstimate,
      kombucha,
      hotChocolate,
      additionalDetails,
      howHeardAboutUs,
    } = body

    // Format drink package name
    const packageName =
      drinkPackage === 'drip'
        ? 'Drip Coffee Package'
        : drinkPackage === 'standard'
        ? `Standard Espresso Package${kombucha ? ' with Kombucha Add-on' : ''}`
        : drinkPackage === 'premium'
        ? `Premium Espresso Package${kombucha ? ' with Kombucha Add-on' : ''}`
        : drinkPackage === 'kombucha'
        ? 'Kombucha Bar Package'
        : 'Hot Chocolate Bar Package'

    // Calculate total hours
    const totalHours = 2 + (extraHours || 0)

    // Send SMS notification to Jennifer (under 160 chars for trial)
    if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
      try {
        const smsMessage = `Booking: ${customerName}\n${phone}\n${eventType} ${new Date(eventDate).toLocaleDateString()}\n$${totalEstimate.toFixed(2)}`

        const smsResult = await twilioClient.messages.create({
          body: smsMessage,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: JENNIFER_PHONE,
        })
        console.log('SMS sent successfully:', smsResult.sid)
      } catch (smsError) {
        console.error('Error sending SMS:', smsError)
      }
    } else {
      console.log('Twilio not configured, skipping SMS')
    }

    // Send email notification to Jennifer
    const jenniferEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 700px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: #1976D2;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background: #fff;
      padding: 30px;
      border: 2px solid #1976D2;
      border-top: none;
    }
    .section {
      margin: 20px 0;
      padding: 15px;
      background: #f5f5f5;
      border-left: 4px solid #1976D2;
    }
    .section h3 {
      margin-top: 0;
      color: #1976D2;
    }
    .highlight {
      background: #FFF8E1;
      padding: 15px;
      margin: 15px 0;
      border-radius: 8px;
      border: 2px solid #FFB74D;
    }
    .contact-info {
      background: #E8F5E9;
      padding: 15px;
      margin: 15px 0;
      border-radius: 8px;
      border: 2px solid #4CAF50;
    }
    .contact-info a {
      color: #2E7D32;
      font-weight: bold;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔔 NEW BOOKING INQUIRY</h1>
  </div>

  <div class="content">
    <div class="contact-info">
      <h3>📞 CUSTOMER CONTACT INFO</h3>
      <p><strong>Name:</strong> ${customerName}</p>
      <p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
      <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
    </div>

    <div class="section">
      <h3>📅 EVENT DETAILS</h3>
      <p><strong>Event Category:</strong> ${eventCategory === 'private' ? 'Private Event' : 'Public Event'}</p>
      ${estimatedPeople ? `<p><strong>Estimated People:</strong> ${estimatedPeople}</p>` : ''}
      <p><strong>Event Type:</strong> ${eventType}</p>
      <p><strong>Date:</strong> ${new Date(eventDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}</p>
      ${eventStartTime ? `<p><strong>Start Time:</strong> ${eventStartTime}</p>` : ''}
      <p><strong>Location:</strong> ${eventAddress}</p>
      ${indoorOutdoor ? `<p><strong>Setup:</strong> ${indoorOutdoor === 'indoor' ? 'Indoor' : 'Outdoor'}</p>` : ''}
    </div>

    ${eventCategory === 'private' ? `
    <div class="section">
      <h3>⚡ SETUP REQUIREMENTS</h3>
      ${powerAvailable ? `<p><strong>Power Available:</strong> ${powerAvailable === 'yes' ? 'Yes' : 'No'}</p>` : ''}
      ${distanceFromPower ? `<p><strong>Distance from Power:</strong> ${distanceFromPower}</p>` : ''}
      ${sinkAvailable ? `<p><strong>Sink Available:</strong> ${sinkAvailable === 'yes' ? 'Yes' : 'No'}</p>` : ''}
      ${trashOnSite ? `<p><strong>Trash on Site:</strong> ${trashOnSite === 'yes' ? 'Yes' : 'No'}</p>` : ''}
    </div>

    ${contactName || contactPhone ? `
    <div class="section">
      <h3>👤 DAY-OF EVENT CONTACT</h3>
      ${contactName ? `<p><strong>Name:</strong> ${contactName}</p>` : ''}
      ${contactPhone ? `<p><strong>Phone:</strong> <a href="tel:${contactPhone}">${contactPhone}</a></p>` : ''}
    </div>
    ` : ''}
    ` : ''}

    ${eventCategory === 'private' && drinkPackage ? `
    <div class="section">
      <h3>☕ SERVICE DETAILS</h3>
      <p><strong>Package:</strong> ${packageName}</p>
      <p><strong>Number of Drinks:</strong> ${numberOfDrinks}</p>
      <p><strong>Service Duration:</strong> ${totalHours} hours</p>
      ${hotChocolate ? '<p><strong>Add-on:</strong> Hot Chocolate</p>' : ''}
      ${kombucha ? '<p><strong>Add-on:</strong> Kombucha ($35)</p>' : ''}
      ${paymentMethod ? `<p><strong>Payment Method:</strong> ${
        paymentMethod === 'openbar' ? 'Open Bar (Host Pays)' :
        paymentMethod === 'ticket' ? 'Ticket System' :
        'Guests Pay Per Drink'
      }</p>` : ''}
      ${drinkLimit && paymentMethod === 'openbar' ? `<p><strong>Drink Limit Reached:</strong> ${
        drinkLimit === 'stop' ? 'Stop Service' : 'Contact Host for Approval'
      }</p>` : ''}
    </div>
    ` : ''}

    ${eventCategory === 'private' && totalEstimate ? `
    <div class="highlight">
      <h3>💰 ESTIMATED TOTAL: $${totalEstimate.toFixed(2)}</h3>
    </div>
    ` : ''}

    ${howHeardAboutUs ? `
    <div class="section">
      <h3>📢 HOW THEY HEARD ABOUT US</h3>
      <p>${howHeardAboutUs}</p>
    </div>
    ` : ''}

    ${additionalDetails ? `
    <div class="section">
      <h3>📝 ADDITIONAL DETAILS</h3>
      <p>${additionalDetails}</p>
    </div>
    ` : ''}

    <p><strong>⏰ Next Steps:</strong> Contact the customer within 24 hours and send Square invoice.</p>
  </div>
</body>
</html>
    `

    try {
      const result = await resend.emails.send({
        from: 'The Porch Coffee Cart <onboarding@resend.dev>',
        to: JENNIFER_EMAIL,
        subject: `🔔 NEW INQUIRY: ${customerName} - ${eventType} on ${new Date(eventDate).toLocaleDateString()}`,
        html: jenniferEmailHtml,
      })
      console.log('Email sent successfully to Jennifer:', result)
    } catch (emailError) {
      console.error('Error sending email to Jennifer:', emailError)
    }

    // Email HTML template for customer
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #6B4423 0%, #3E2723 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
    }
    .content {
      background: #fff;
      padding: 30px;
      border: 1px solid #e0e0e0;
      border-top: none;
    }
    .detail-row {
      margin: 15px 0;
      padding: 15px;
      background: #f9f9f9;
      border-left: 4px solid #6B4423;
    }
    .detail-row strong {
      color: #6B4423;
    }
    .estimate {
      background: #FFF8E1;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
      border: 2px solid #FFB74D;
    }
    .estimate h2 {
      color: #E65100;
      margin-top: 0;
    }
    .total {
      font-size: 24px;
      color: #E65100;
      font-weight: bold;
      margin-top: 15px;
    }
    .contact {
      background: #E3F2FD;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
    }
    .contact h3 {
      color: #1565C0;
      margin-top: 0;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>☕ The Porch Coffee Cart</h1>
    <p>Your Event Proposal</p>
  </div>

  <div class="content">
    <h2>Hello ${customerName}!</h2>
    <p>
      Thank you for your interest in The Porch Coffee Cart! We're brewing up something special for your ${eventType}.
    </p>

    <h3>Event Details</h3>
    <div class="detail-row">
      <strong>Date:</strong> ${new Date(eventDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}
    </div>
    <div class="detail-row">
      <strong>Location:</strong> ${eventAddress}
    </div>

    <h3>Service Details</h3>
    <div class="detail-row">
      <strong>Package:</strong> ${packageName}<br>
      <strong>Number of Drinks:</strong> ${numberOfDrinks} drinks<br>
      <strong>Service Duration:</strong> ${totalHours} hours
      ${hotChocolate ? '<br><strong>Add-on:</strong> Hot Chocolate' : ''}
      ${kombucha ? '<br><strong>Add-on:</strong> Kombucha ($35)' : ''}
    </div>

    <div class="estimate">
      <h2>Estimated Total</h2>
      <p>Based on your selections, here's your estimated investment:</p>
      <div class="total">$${totalEstimate.toFixed(2)}</div>
      <p style="font-size: 12px; color: #666; margin-top: 15px;">
        * This is an estimate. Final pricing will be confirmed in your invoice.
      </p>
    </div>

    <div class="contact">
      <h3>Next Steps</h3>
      <p>
        We'll review your inquiry and send you an official invoice via Square within 24 hours.
        If you have any questions in the meantime, feel free to reach out!
      </p>
      <p>
        <strong>📞 Phone:</strong> [YOUR PHONE NUMBER]<br>
        <strong>✉️ Email:</strong> [YOUR EMAIL]<br>
        <strong>🌐 Website:</strong> [YOUR WEBSITE]
      </p>
    </div>

    <p>
      We can't wait to serve amazing coffee at your event!
    </p>

    <p>
      Warm regards,<br>
      <strong>The Porch Coffee Cart Team</strong>
    </p>
  </div>

  <div class="footer">
    <p>© ${new Date().getFullYear()} The Porch Coffee Cart. All rights reserved.</p>
  </div>
</body>
</html>
    `

    // Send email to customer using Resend
    try {
      const customerEmailResult = await resend.emails.send({
        from: 'The Porch Coffee Cart <onboarding@resend.dev>',
        to: [email],
        subject: `Your Coffee Cart Event Proposal - ${new Date(eventDate).toLocaleDateString()}`,
        html: emailHtml,
      })
      console.log('Customer email sent successfully:', customerEmailResult)
    } catch (customerEmailError) {
      console.error('Error sending customer email:', customerEmailError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json({ success: false, error: 'Failed to send email' }, { status: 500 })
  }
}
