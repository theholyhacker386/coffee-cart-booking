'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Phone,
  Coffee,
  Calendar,
  Users,
  CreditCard,
  Sun,
  Zap,
  Droplets,
  Trash2,
  Car,
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react'
import ScheduleTimeline from '@/components/ScheduleTimeline'
import EarningsCard from '@/components/EarningsCard'
import ChecklistProgress from '@/components/ChecklistProgress'
import SwipeableChecklistItem from '@/components/SwipeableChecklistItem'
import { DRINK_RECIPES } from '@/lib/checklist-generator'

// ----- Type definitions -----

interface Booking {
  id: string
  customer_name: string
  email: string
  phone: string
  event_date: string
  event_start_time: string
  event_address: string
  event_type: string
  custom_event_type?: string | null
  event_category: string
  indoor_outdoor: string | null
  power_available: string | null
  distance_from_power: string | null
  sink_available: string | null
  trash_on_site: string | null
  contact_name: string | null
  contact_phone: string | null
  payment_method: string | null
  drink_package: string | null
  number_of_drinks: number | null
  drink_limit: string | null
  extra_hours: number
  hot_chocolate_addon: boolean
  kombucha_addon: boolean
  travel_distance_miles: number | null
  travel_drive_minutes: number | null
  travel_fee: number | null
  total_estimate: number | null
  estimated_people: string | null
  additional_details: string | null
  status: string
}

interface ChecklistItem {
  id: string
  booking_id: string
  item_text: string
  category: string
  phase: string
  sort_order: number
  completed: boolean
  completed_by: string | null
  completed_at: string | null
}

// ----- Helper functions -----

function getPackageName(drinkPackage: string | null | undefined): string {
  switch (drinkPackage) {
    case 'drip': return 'Drip Coffee'
    case 'standard': return 'Standard Espresso'
    case 'premium': return 'Premium Espresso'
    case 'kombucha': return 'Kombucha Bar'
    case 'hotchoc': return 'Hot Chocolate Bar'
    default: return 'Public Event'
  }
}

function getPaymentMethodName(method: string | null | undefined): string {
  switch (method) {
    case 'openbar': return 'Open Bar'
    case 'ticket': return 'Ticket System'
    case 'guestpay': return 'Guest Pay'
    default: return 'N/A'
  }
}

function getEventTypeName(eventType: string, customEventType?: string | null): string {
  if (eventType === 'Other' && customEventType) return customEventType
  return eventType || 'Event'
}

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function isEventSoonEnoughForDayBefore(eventDate: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const event = new Date(eventDate + 'T12:00:00')
  event.setHours(0, 0, 0, 0)

  const diffMs = event.getTime() - today.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  // Show if event is today (0) or tomorrow (1)
  return diffDays >= 0 && diffDays <= 1
}

// ----- Status badge component -----

function StatusBadge({ status }: { status: string }) {
  let bgClass = 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  let icon = <Clock className="w-3 h-3" />
  let label = 'Pending'

  if (status === 'confirmed') {
    bgClass = 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    icon = <ShieldCheck className="w-3 h-3" />
    label = 'Confirmed'
  } else if (status === 'completed') {
    bgClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    icon = <CheckCircle2 className="w-3 h-3" />
    label = 'Completed'
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${bgClass}`}>
      {icon}
      {label}
    </span>
  )
}

// ----- Main page component -----

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string

  const [booking, setBooking] = useState<Booking | null>(null)
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [recipesOpen, setRecipesOpen] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [completionMessage, setCompletionMessage] = useState('')

  // Fetch booking + checklist data
  const fetchData = useCallback(async () => {
    try {
      const [bookingRes, checklistRes] = await Promise.all([
        fetch(`/api/bookings/${bookingId}`),
        fetch(`/api/bookings/${bookingId}/checklist`),
      ])

      if (!bookingRes.ok) {
        setError('Could not load event details.')
        setLoading(false)
        return
      }

      const bookingData = await bookingRes.json()
      setBooking(bookingData)

      if (checklistRes.ok) {
        const checklistData = await checklistRes.json()
        setChecklistItems(checklistData)
      }
    } catch {
      setError('Something went wrong loading this event.')
    } finally {
      setLoading(false)
    }
  }, [bookingId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Handle completing a checklist item (swipe)
  const handleComplete = useCallback(async (itemId: string) => {
    // Optimistic update
    setChecklistItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, completed: true, completed_at: new Date().toISOString() } : item
      )
    )

    try {
      const res = await fetch(`/api/bookings/${bookingId}/checklist`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, completed: true }),
      })

      if (!res.ok) {
        // Revert optimistic update
        setChecklistItems(prev =>
          prev.map(item =>
            item.id === itemId ? { ...item, completed: false, completed_at: null } : item
          )
        )
      }
    } catch {
      // Revert on network error
      setChecklistItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, completed: false, completed_at: null } : item
        )
      )
    }
  }, [bookingId])

  // Handle uncompleting a checklist item (tap on completed item)
  const handleUncomplete = useCallback(async (itemId: string) => {
    // Optimistic update
    setChecklistItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, completed: false, completed_by: null, completed_at: null } : item
      )
    )

    try {
      const res = await fetch(`/api/bookings/${bookingId}/checklist`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, completed: false }),
      })

      if (!res.ok) {
        // Revert
        setChecklistItems(prev =>
          prev.map(item =>
            item.id === itemId ? { ...item, completed: true, completed_at: new Date().toISOString() } : item
          )
        )
      }
    } catch {
      setChecklistItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, completed: true, completed_at: new Date().toISOString() } : item
        )
      )
    }
  }, [bookingId])

  // Handle marking event as completed
  const handleCompleteEvent = useCallback(async () => {
    setCompleting(true)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/complete`, {
        method: 'POST',
      })

      if (res.ok) {
        setCompletionMessage('Event marked complete! Mileage email sent to Jennifer.')
        if (booking) {
          setBooking({ ...booking, status: 'completed' })
        }
      } else {
        setCompletionMessage('Something went wrong. Please try again.')
      }
    } catch {
      setCompletionMessage('Network error. Please try again.')
    } finally {
      setCompleting(false)
    }
  }, [bookingId, booking])

  // Derive checklist phase groups
  const dayBeforeItems = checklistItems.filter(i => i.phase === 'day_before')
  const dayOfItems = checklistItems.filter(i => i.phase === 'day_of')
  const restockItems = checklistItems.filter(i => i.phase === 'restock')

  const dayBeforeCompleted = dayBeforeItems.filter(i => i.completed).length
  const dayOfCompleted = dayOfItems.filter(i => i.completed).length
  const restockCompleted = restockItems.filter(i => i.completed).length

  const allDayOfComplete = dayOfItems.length > 0 && dayOfCompleted === dayOfItems.length
  const allItemsComplete = checklistItems.length > 0 &&
    checklistItems.every(i => i.completed)

  // Group day_of items by category
  const dayOfByCategory: Record<string, ChecklistItem[]> = {}
  for (const item of dayOfItems) {
    const cat = item.category || 'other'
    if (!dayOfByCategory[cat]) dayOfByCategory[cat] = []
    dayOfByCategory[cat].push(item)
  }

  // Render category label nicely
  const categoryLabels: Record<string, string> = {
    essentials: 'ESSENTIALS',
    espresso: 'ESPRESSO',
    premium: 'PREMIUM',
    drip: 'DRIP',
    venue: 'VENUE',
    payment: 'PAYMENT',
    planning: 'PLANNING',
    other: 'OTHER',
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-3" />
          <p className="text-sm text-gray-400">Loading event details...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
        <p className="text-red-400 text-sm mb-4">{error || 'Event not found.'}</p>
        <button
          onClick={() => router.push('/employee/dashboard')}
          className="text-amber-400 text-sm underline"
        >
          Back to dashboard
        </button>
      </div>
    )
  }

  const displayEventType = getEventTypeName(booking.event_type, booking.custom_event_type)
  const showDayBefore = isEventSoonEnoughForDayBefore(booking.event_date)

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800/50">
        <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
          <button
            onClick={() => router.push('/employee/dashboard')}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-300" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-white truncate">
              {displayEventType} — {booking.customer_name}
            </h1>
          </div>
          <StatusBadge status={booking.status} />
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 px-4 pb-10 max-w-lg mx-auto w-full space-y-6 mt-5">

        {/* ===== B. SCHEDULE TIMELINE ===== */}
        <section className="bg-gray-900 border border-gray-700/50 rounded-2xl p-5">
          <ScheduleTimeline
            eventStartTime={booking.event_start_time || '12:00 PM'}
            extraHours={booking.extra_hours || 0}
            travelDriveMinutes={booking.travel_drive_minutes || 0}
            eventDate={booking.event_date}
          />
        </section>

        {/* ===== C. EARNINGS ESTIMATE ===== */}
        <section>
          <h2 className="text-xs font-bold tracking-widest text-amber-400 uppercase mb-3">
            Your Earnings
          </h2>
          <EarningsCard
            extraHours={booking.extra_hours || 0}
            travelDriveMinutes={booking.travel_drive_minutes || 0}
            travelDistanceMiles={booking.travel_distance_miles || 0}
          />
        </section>

        {/* ===== D. EVENT DETAILS CARD ===== */}
        <section>
          <h2 className="text-xs font-bold tracking-widest text-amber-400 uppercase mb-3">
            Event Details
          </h2>
          <div className="bg-gray-900 border border-gray-700/50 rounded-2xl p-5 space-y-4">
            {/* Customer name */}
            <div className="flex items-start gap-3">
              <Users className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Customer</p>
                <p className="text-sm text-gray-200">{booking.customer_name}</p>
              </div>
            </div>

            {/* Event type */}
            <div className="flex items-start gap-3">
              <Coffee className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Event Type</p>
                <p className="text-sm text-gray-200">{displayEventType}</p>
              </div>
            </div>

            {/* Event date */}
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Date</p>
                <p className="text-sm text-gray-200">{formatEventDate(booking.event_date)}</p>
              </div>
            </div>

            {/* Event address */}
            {booking.event_address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Address</p>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(booking.event_address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-amber-400 underline underline-offset-2"
                  >
                    {booking.event_address}
                  </a>
                </div>
              </div>
            )}

            {/* Day-of contact */}
            {(booking.contact_name || booking.contact_phone) && (
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Day-of Contact</p>
                  <p className="text-sm text-gray-200">
                    {booking.contact_name || 'N/A'}
                    {booking.contact_phone && (
                      <>
                        {' — '}
                        <a
                          href={`tel:${booking.contact_phone}`}
                          className="text-amber-400 underline underline-offset-2"
                        >
                          {booking.contact_phone}
                        </a>
                      </>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Package type */}
            {booking.drink_package && (
              <div className="flex items-start gap-3">
                <Coffee className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Package</p>
                  <p className="text-sm text-gray-200">{getPackageName(booking.drink_package)}</p>
                </div>
              </div>
            )}

            {/* Number of drinks */}
            {booking.number_of_drinks && (
              <div className="flex items-start gap-3">
                <Coffee className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Number of Drinks</p>
                  <p className="text-sm text-gray-200">{booking.number_of_drinks}</p>
                </div>
              </div>
            )}

            {/* Payment method */}
            {booking.payment_method && (
              <div className="flex items-start gap-3">
                <CreditCard className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Payment Method</p>
                  <p className="text-sm text-gray-200">{getPaymentMethodName(booking.payment_method)}</p>
                </div>
              </div>
            )}

            {/* Indoor/Outdoor */}
            {booking.indoor_outdoor && (
              <div className="flex items-start gap-3">
                <Sun className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Indoor/Outdoor</p>
                  <p className="text-sm text-gray-200">
                    {booking.indoor_outdoor === 'indoor' ? 'Indoor' : 'Outdoor'}
                  </p>
                </div>
              </div>
            )}

            {/* Power */}
            {booking.power_available && (
              <div className="flex items-start gap-3">
                <Zap className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Power</p>
                  <p className="text-sm text-gray-200">
                    {booking.power_available === 'yes' ? 'Yes' : 'No'}
                    {booking.power_available === 'yes' && booking.distance_from_power && (
                      <span className="text-gray-400"> — {booking.distance_from_power} from power</span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Sink */}
            {booking.sink_available && (
              <div className="flex items-start gap-3">
                <Droplets className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Sink</p>
                  <p className="text-sm text-gray-200">
                    {booking.sink_available === 'yes' ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            )}

            {/* Trash */}
            {booking.trash_on_site && (
              <div className="flex items-start gap-3">
                <Trash2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Trash on Site</p>
                  <p className="text-sm text-gray-200">
                    {booking.trash_on_site === 'yes' ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            )}

            {/* Drive distance */}
            {(booking.travel_distance_miles || booking.travel_drive_minutes) && (
              <div className="flex items-start gap-3">
                <Car className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Drive</p>
                  <p className="text-sm text-gray-200">
                    {booking.travel_distance_miles ?? '?'} miles, ~{booking.travel_drive_minutes ?? '?'} min
                  </p>
                </div>
              </div>
            )}

            {/* Additional details */}
            {booking.additional_details && (
              <div className="flex items-start gap-3">
                <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Special Requests</p>
                  <p className="text-sm text-gray-200">{booking.additional_details}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ===== E. DRINK RECIPES ===== */}
        <section>
          <button
            onClick={() => setRecipesOpen(!recipesOpen)}
            className="w-full flex items-center justify-between bg-gray-900 border border-gray-700/50 rounded-2xl px-5 py-3"
          >
            <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
              Drink Recipes
            </span>
            {recipesOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          {recipesOpen && (
            <div className="mt-2 bg-gray-900 border border-gray-700/50 rounded-2xl p-5 space-y-2">
              {Object.entries(DRINK_RECIPES).map(([key, recipe]) => (
                <div key={key} className="flex items-baseline gap-2">
                  <span className="text-xs text-amber-400 font-medium uppercase">{key}:</span>
                  <span className="text-sm text-gray-300">{recipe}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ===== F. DAY-BEFORE PREP CHECKLIST ===== */}
        {showDayBefore && dayBeforeItems.length > 0 && (
          <section>
            <h2 className="text-xs font-bold tracking-widest text-amber-400 uppercase mb-2">
              Day-Before Prep
            </h2>
            <div className="mb-3">
              <ChecklistProgress completed={dayBeforeCompleted} total={dayBeforeItems.length} />
            </div>
            <div>
              {dayBeforeItems.map(item => (
                <SwipeableChecklistItem
                  key={item.id}
                  id={item.id}
                  text={item.item_text}
                  completed={item.completed}
                  completedBy={item.completed_by}
                  onComplete={handleComplete}
                  onUncomplete={handleUncomplete}
                />
              ))}
            </div>
          </section>
        )}

        {/* ===== G. DAY-OF LOADING CHECKLIST ===== */}
        {dayOfItems.length > 0 && (
          <section>
            <h2 className="text-xs font-bold tracking-widest text-amber-400 uppercase mb-2">
              Loading Checklist
            </h2>
            <div className="mb-3">
              <ChecklistProgress completed={dayOfCompleted} total={dayOfItems.length} />
            </div>

            {/* Group by category */}
            {Object.entries(dayOfByCategory).map(([category, items]) => (
              <div key={category} className="mb-4">
                <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-2 px-1">
                  {categoryLabels[category] || category.toUpperCase()}
                </p>
                {items.map(item => (
                  <SwipeableChecklistItem
                    key={item.id}
                    id={item.id}
                    text={item.item_text}
                    completed={item.completed}
                    completedBy={item.completed_by}
                    onComplete={handleComplete}
                    onUncomplete={handleUncomplete}
                  />
                ))}
              </div>
            ))}

            {/* Ready to Go! banner */}
            {allDayOfComplete && (
              <div className="ready-to-go bg-emerald-900/40 border border-emerald-500/40 rounded-2xl p-6 text-center mt-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                <h3 className="text-lg font-bold text-emerald-300">Ready to Go!</h3>
                <p className="text-sm text-emerald-400/70 mt-1">All loading items checked off</p>
              </div>
            )}
          </section>
        )}

        {/* ===== H. RESTOCK CHECKLIST ===== */}
        {restockItems.length > 0 && (
          <section>
            <h2 className="text-xs font-bold tracking-widest text-amber-400 uppercase mb-2">
              Restock (After Event)
            </h2>
            <div className="mb-3">
              <ChecklistProgress completed={restockCompleted} total={restockItems.length} />
            </div>
            <div>
              {restockItems.map(item => (
                <SwipeableChecklistItem
                  key={item.id}
                  id={item.id}
                  text={item.item_text}
                  completed={item.completed}
                  completedBy={item.completed_by}
                  onComplete={handleComplete}
                  onUncomplete={handleUncomplete}
                />
              ))}
            </div>
          </section>
        )}

        {/* ===== I. COMPLETION SECTION ===== */}
        {allItemsComplete && booking.status !== 'completed' && !completionMessage && (
          <section className="pb-4">
            <button
              onClick={handleCompleteEvent}
              disabled={completing}
              className="w-full py-4 rounded-2xl text-base font-bold transition-all duration-200 bg-gradient-to-r from-amber-500 to-amber-600 text-gray-950 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] disabled:opacity-50"
            >
              {completing ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Completing...
                </span>
              ) : (
                'Mark Event as Completed'
              )}
            </button>
          </section>
        )}

        {/* Completion success message */}
        {completionMessage && (
          <section className="pb-4">
            <div className="bg-emerald-900/40 border border-emerald-500/40 rounded-2xl p-5 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-emerald-300 font-medium">{completionMessage}</p>
            </div>
          </section>
        )}

        {/* Already completed */}
        {booking.status === 'completed' && !completionMessage && (
          <section className="pb-4">
            <div className="bg-emerald-900/20 border border-emerald-800/30 rounded-2xl p-5 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
              <p className="text-sm text-emerald-400/70 font-medium">This event has been completed</p>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
