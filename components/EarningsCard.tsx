'use client'

import React from 'react'

interface EarningsCardProps {
  extraHours: number             // 0-6
  travelDriveMinutes: number     // one-way drive time in minutes
  travelDistanceMiles: number    // one-way distance in miles
}

// Constants
const HOURLY_RATE = 15.0       // per employee
const IRS_MILEAGE_RATE = 0.725 // per mile

/** Format a number as dollars with 2 decimal places. */
function usd(amount: number): string {
  return `$${amount.toFixed(2)}`
}

export default function EarningsCard({
  extraHours,
  travelDriveMinutes,
  travelDistanceMiles,
}: EarningsCardProps) {
  // ----- Calculations -----
  const serviceHours = 2 + extraHours
  const roundTripMinutes = travelDriveMinutes * 2
  const driveTimeHours = roundTripMinutes / 60

  const servicePay = serviceHours * HOURLY_RATE
  const drivePay = driveTimeHours * HOURLY_RATE
  const hourlySubtotal = servicePay + drivePay

  const roundTripMiles = travelDistanceMiles * 2
  const mileageReimbursement = roundTripMiles * IRS_MILEAGE_RATE

  const total = hourlySubtotal + mileageReimbursement

  return (
    <div className="w-full bg-gray-900 border border-gray-700/50 rounded-2xl p-5 sm:p-6 shadow-lg">
      {/* ===== HOURLY PAY SECTION ===== */}
      <div className="mb-6">
        <h3 className="text-xs font-bold tracking-widest text-amber-400 uppercase mb-1">
          Hourly Pay
        </h3>
        <div className="h-px bg-gradient-to-r from-amber-500/60 to-transparent mb-4" />

        {/* Service time row */}
        <div className="flex items-baseline justify-between text-sm mb-2">
          <span className="text-gray-300">
            Service time:&nbsp;&nbsp;{serviceHours} hr{serviceHours !== 1 ? 's' : ''} &times; {usd(HOURLY_RATE)}/hr
          </span>
          <span className="text-gray-100 font-medium font-mono">{usd(servicePay)}</span>
        </div>

        {/* Drive time row */}
        <div className="flex items-baseline justify-between text-sm mb-3">
          <span className="text-gray-300">
            Drive time:&nbsp;&nbsp;{roundTripMinutes} min &times; {usd(HOURLY_RATE)}/hr
          </span>
          <span className="text-gray-100 font-medium font-mono">{usd(drivePay)}</span>
        </div>

        {/* Subtotal divider */}
        <div className="h-px bg-gray-700 mb-2" />
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-gray-400">Subtotal</span>
          <span className="text-gray-100 font-semibold font-mono">{usd(hourlySubtotal)}</span>
        </div>
      </div>

      {/* ===== MILEAGE REIMBURSEMENT SECTION ===== */}
      <div className="mb-6">
        <h3 className="text-xs font-bold tracking-widest text-amber-400 uppercase mb-1">
          Mileage Reimbursement
        </h3>
        <div className="h-px bg-gradient-to-r from-amber-500/60 to-transparent mb-4" />

        {/* Mileage row */}
        <div className="flex items-baseline justify-between text-sm mb-2">
          <span className="text-gray-300">
            {roundTripMiles.toFixed(1)} mi round trip &times; {usd(IRS_MILEAGE_RATE)}/mi
          </span>
          <span className="text-gray-100 font-medium font-mono">{usd(mileageReimbursement)}</span>
        </div>

        <p className="text-xs text-gray-500 italic">
          IRS standard rate &mdash; paid on top of hourly
        </p>
      </div>

      {/* ===== TOTAL ===== */}
      <div className="h-px bg-gray-700 mb-3" />
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-bold text-amber-300 uppercase tracking-wide">
          Total Earnings
        </span>
        <span className="text-lg font-bold text-amber-400 font-mono">
          {usd(total)}
        </span>
      </div>
      <p className="text-xs text-gray-500 text-right mt-1">
        before tips
      </p>
    </div>
  )
}
