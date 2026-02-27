'use client'

import { useEffect, useRef } from 'react'

interface BookingTrackerProps {
  eventType: string
  estimatedGuests: number
}

export default function BookingTracker({ eventType, estimatedGuests }: BookingTrackerProps) {
  const tracked = useRef(false)

  useEffect(() => {
    if (tracked.current) return
    tracked.current = true

    // Meta Pixel: Lead event (booking inquiry submitted)
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Lead', {
        content_name: `Coffee Cart Booking - ${eventType}`,
        content_category: eventType,
        value: estimatedGuests,
        currency: 'USD',
      })
    }
  }, [eventType, estimatedGuests])

  return null
}
