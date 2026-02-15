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
  UserPlus,
  X,
  Shield,
  DollarSign,
  Save,
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
  staffing?: number
  assigned_employees?: string[]
  total_sales?: number | null
}

interface Employee {
  id: string
  name: string
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
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [allEmployees, setAllEmployees] = useState<Employee[]>([])
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [savingAssignment, setSavingAssignment] = useState(false)

  // Admin profit tracking
  const [isAdmin, setIsAdmin] = useState(false)
  const [totalSalesInput, setTotalSalesInput] = useState('')
  const [savingSales, setSavingSales] = useState(false)
  const [salesSaved, setSalesSaved] = useState(false)
  const [currentEmployeeId, setCurrentEmployeeId] = useState('')
  const [currentEmployeeName, setCurrentEmployeeName] = useState('')

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

  // Fetch current employee identity for time clock + admin check
  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch('/api/employee/me')
        if (res.ok) {
          const data = await res.json()
          setCurrentEmployeeId(data.id || '')
          setCurrentEmployeeName(data.name || '')
          setIsAdmin(data.role === 'admin')
        }
      } catch {
        // Non-critical — time clock just won't show employee name
      }
    }
    fetchMe()
  }, [])

  // Initialize total sales input when booking loads
  useEffect(() => {
    if (booking?.total_sales !== undefined && booking.total_sales !== null) {
      setTotalSalesInput(booking.total_sales.toString())
    }
  }, [booking?.total_sales])

  // Save total sales (admin only)
  const handleSaveTotalSales = useCallback(async () => {
    if (!booking) return
    setSavingSales(true)
    setSalesSaved(false)
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total_sales: parseFloat(totalSalesInput) || 0 }),
      })
      if (res.ok) {
        const updated = await res.json()
        setBooking(prev => prev ? { ...prev, total_sales: updated.total_sales } : prev)
        setSalesSaved(true)
        setTimeout(() => setSalesSaved(false), 2000)
      }
    } catch {
      // Failed to save
    } finally {
      setSavingSales(false)
    }
  }, [bookingId, totalSalesInput, booking])

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

  // Open assignment modal and fetch employee list
  const openAssignModal = useCallback(async () => {
    setShowAssignModal(true)
    setSelectedEmployees(booking?.assigned_employees || [])

    try {
      const res = await fetch('/api/employees')
      if (res.ok) {
        const data = await res.json()
        setAllEmployees(data)
      }
    } catch {
      // Failed to load employees
    }
  }, [booking?.assigned_employees])

  // Toggle employee selection in the modal
  const toggleEmployee = useCallback((employeeId: string) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    )
  }, [])

  // Save the assignment
  const saveAssignment = useCallback(async () => {
    setSavingAssignment(true)
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigned_employees: selectedEmployees }),
      })

      if (res.ok) {
        const updatedBooking = await res.json()
        setBooking(prev => prev ? { ...prev, assigned_employees: updatedBooking.assigned_employees } : prev)
        setShowAssignModal(false)
      }
    } catch {
      // Network error
    } finally {
      setSavingAssignment(false)
    }
  }, [bookingId, selectedEmployees])

  // Get display names for assigned employees
  const getAssignedNames = useCallback((): string[] => {
    if (!booking?.assigned_employees || booking.assigned_employees.length === 0) return []
    if (allEmployees.length === 0) return booking.assigned_employees.map(() => 'Loading...')
    return booking.assigned_employees.map(id => {
      const emp = allEmployees.find(e => e.id === id)
      return emp ? emp.name : 'Unknown'
    })
  }, [booking?.assigned_employees, allEmployees])

  // Fetch employee names for display (on initial load)
  useEffect(() => {
    if (booking?.assigned_employees && booking.assigned_employees.length > 0 && allEmployees.length === 0) {
      fetch('/api/employees')
        .then(res => res.ok ? res.json() : [])
        .then(data => setAllEmployees(data))
        .catch(() => {})
    }
  }, [booking?.assigned_employees, allEmployees.length])

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

        {/* ===== ADMIN PROFIT SUMMARY ===== */}
        {isAdmin && (
          <section>
            <h2 className="text-xs font-bold tracking-widest text-amber-400 uppercase mb-3 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" />
              Profit Summary
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Admin</span>
            </h2>
            <div className="bg-gray-900 border border-gray-700/50 rounded-2xl p-5">
              {/* Total Sales Input */}
              <div className="mb-5">
                <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">Total Sales</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={totalSalesInput}
                      onChange={e => setTotalSalesInput(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors text-sm font-mono"
                    />
                  </div>
                  <button
                    onClick={handleSaveTotalSales}
                    disabled={savingSales}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium bg-amber-500 text-gray-950 hover:bg-amber-400 active:scale-[0.98] disabled:opacity-50 transition-all"
                  >
                    {savingSales ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : salesSaved ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {salesSaved ? 'Saved' : 'Save'}
                  </button>
                </div>
              </div>

              {/* Profit calculation */}
              {(() => {
                const sales = parseFloat(totalSalesInput) || 0
                const staffCount = booking.staffing || 1
                const serviceHours = 2 + (booking.extra_hours || 0)
                const driveTimeHours = ((booking.travel_drive_minutes || 0) * 2) / 60
                const totalWorkHours = serviceHours + driveTimeHours
                const hourlyCost = staffCount * totalWorkHours * 15
                const mileageCost = staffCount * ((booking.travel_distance_miles || 0) * 2) * 0.725
                const totalEmployeeCost = hourlyCost + mileageCost
                const netProfit = sales - totalEmployeeCost
                const profitColor = netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                const profitBg = netProfit >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'

                return (
                  <>
                    {/* Revenue */}
                    <div className="flex items-baseline justify-between text-sm mb-3">
                      <span className="text-gray-300">Revenue</span>
                      <span className="text-gray-100 font-medium font-mono">${sales.toFixed(2)}</span>
                    </div>

                    {/* Employee costs header */}
                    <div className="mb-2">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Employee Costs</span>
                    </div>

                    {/* Hourly cost */}
                    <div className="flex items-baseline justify-between text-sm mb-1.5 pl-3">
                      <span className="text-gray-400 text-xs">
                        Hourly ({staffCount} emp x {totalWorkHours.toFixed(1)} hrs x $15)
                      </span>
                      <span className="text-red-300 font-mono text-xs">-${hourlyCost.toFixed(2)}</span>
                    </div>

                    {/* Mileage cost */}
                    <div className="flex items-baseline justify-between text-sm mb-3 pl-3">
                      <span className="text-gray-400 text-xs">
                        Mileage ({staffCount} x {((booking.travel_distance_miles || 0) * 2).toFixed(0)} mi x $0.725)
                      </span>
                      <span className="text-red-300 font-mono text-xs">-${mileageCost.toFixed(2)}</span>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gray-700 mb-3" />

                    {/* Net Profit */}
                    <div className={`flex items-baseline justify-between p-3 rounded-xl border ${profitBg}`}>
                      <span className="text-sm font-bold text-gray-200">Net Profit</span>
                      <span className={`text-lg font-bold font-mono ${profitColor}`}>
                        {netProfit < 0 ? '-' : ''}${Math.abs(netProfit).toFixed(2)}
                      </span>
                    </div>
                  </>
                )
              })()}
            </div>
          </section>
        )}

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

            {/* Staffing */}
            <div className="flex items-start gap-3">
              <Users className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Staffing</p>
                <p className="text-sm text-gray-200">
                  {(booking.staffing || 1) === 2 ? (
                    <span className="text-blue-300 font-medium">2-Person Event</span>
                  ) : (
                    '1-Person Event'
                  )}
                </p>
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

        {/* ===== ASSIGNED EMPLOYEES ===== */}
        <section>
          <h2 className="text-xs font-bold tracking-widest text-amber-400 uppercase mb-3">
            Assigned To
          </h2>
          <div className="bg-gray-900 border border-gray-700/50 rounded-2xl p-5">
            {booking.assigned_employees && booking.assigned_employees.length > 0 ? (
              <div className="space-y-2 mb-4">
                {getAssignedNames().map((name, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-sm text-gray-200">{name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-4">Not yet assigned</p>
            )}
            <button
              onClick={openAssignModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-xl text-sm font-medium hover:bg-blue-500/30 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              {booking.assigned_employees && booking.assigned_employees.length > 0 ? 'Edit Assignment' : 'Assign Employees'}
            </button>
          </div>
        </section>

        {/* ===== ASSIGNMENT MODAL ===== */}
        {showAssignModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowAssignModal(false)}
            />
            <div className="relative bg-gray-900 border border-gray-700/50 rounded-t-2xl sm:rounded-2xl w-full max-w-md mx-auto p-5 max-h-[70vh] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-white">Assign Employees</h3>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1 mb-4">
                {allEmployees.length === 0 && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                  </div>
                )}
                {allEmployees.map(emp => (
                  <label
                    key={emp.id}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(emp.id)}
                      onChange={() => toggleEmployee(emp.id)}
                      className="w-4 h-4 rounded border-white/20 bg-white/10 text-amber-500 focus:ring-amber-500/50 accent-amber-500"
                    />
                    <span className="text-sm text-gray-200">{emp.name}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={saveAssignment}
                disabled={savingAssignment}
                className="w-full py-3 rounded-xl text-sm font-bold bg-amber-500 text-gray-950 hover:bg-amber-400 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
              >
                {savingAssignment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  `Save (${selectedEmployees.length} selected)`
                )}
              </button>
            </div>
          </div>
        )}

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
