'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Shield,
  Loader2,
  Plus,
  Calendar,
  Repeat,
} from 'lucide-react'

interface Employee {
  id: string
  name: string
}

const EVENT_TYPES = [
  'Wedding',
  'Birthday',
  'Corporate',
  'Market',
  'Festival',
  'Recurring',
  'Other',
]

const TIME_OPTIONS = [
  '6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM',
  '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
  '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM',
  '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM',
  '10:00 PM',
]

const PACKAGES = [
  { value: 'drip', label: 'Drip Coffee' },
  { value: 'standard', label: 'Standard Espresso' },
  { value: 'premium', label: 'Premium Espresso' },
  { value: 'kombucha', label: 'Kombucha Bar' },
  { value: 'hotchoc', label: 'Hot Chocolate Bar' },
  { value: 'full', label: 'Full Menu (Public)' },
]

const PAYMENT_METHODS = [
  { value: 'openbar', label: 'Open Bar' },
  { value: 'ticket', label: 'Ticket System' },
  { value: 'guestpay', label: 'Guest Pay' },
]

const FREQUENCY_OPTIONS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'monthly', label: 'Monthly' },
]

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0]
}

function generateRecurringDates(
  startDate: string,
  frequency: string,
  endDate: string | null,
  ongoing: boolean
): string[] {
  const dates: string[] = []
  const start = new Date(startDate + 'T12:00:00')
  const end = ongoing
    ? addMonths(start, 3)
    : new Date((endDate || startDate) + 'T12:00:00')

  let current = start
  // Skip the first date (it's already the main event)
  while (true) {
    if (frequency === 'weekly') {
      current = addDays(current, 7)
    } else if (frequency === 'biweekly') {
      current = addDays(current, 14)
    } else if (frequency === 'monthly') {
      current = addMonths(current, 1)
    }

    if (current > end) break
    dates.push(formatDateForInput(current))
  }

  return dates
}

export default function CreateEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [allEmployees, setAllEmployees] = useState<Employee[]>([])

  // Form fields
  const [eventType, setEventType] = useState('Wedding')
  const [customEventType, setCustomEventType] = useState('')
  const [eventCategory, setEventCategory] = useState<'private' | 'public'>('private')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventStartTime, setEventStartTime] = useState('10:00 AM')
  const [eventAddress, setEventAddress] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [drinkPackage, setDrinkPackage] = useState('standard')
  const [numberOfDrinks, setNumberOfDrinks] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('openbar')
  const [extraHours, setExtraHours] = useState('0')
  const [indoorOutdoor, setIndoorOutdoor] = useState('outdoor')
  const [powerAvailable, setPowerAvailable] = useState('yes')
  const [distanceFromPower, setDistanceFromPower] = useState('')
  const [sinkAvailable, setSinkAvailable] = useState('no')
  const [trashOnSite, setTrashOnSite] = useState('no')
  const [travelDistanceMiles, setTravelDistanceMiles] = useState('')
  const [travelDriveMinutes, setTravelDriveMinutes] = useState('')
  const [calculatingDistance, setCalculatingDistance] = useState(false)
  const [additionalDetails, setAdditionalDetails] = useState('')
  const [assignedEmployees, setAssignedEmployees] = useState<string[]>([])
  const [staffing, setStaffing] = useState('1')
  const [staffingOverride, setStaffingOverride] = useState(false)
  const [status, setStatus] = useState('confirmed')

  // Recurring fields
  const [isRecurring, setIsRecurring] = useState(false)
  const [frequency, setFrequency] = useState('weekly')
  const [recurringEndDate, setRecurringEndDate] = useState('')
  const [ongoingRecurring, setOngoingRecurring] = useState(false)

  // Auto-calculate travel distance when address changes
  async function calculateDistance(address: string) {
    if (!address || address.trim().length < 5) return
    setCalculatingDistance(true)
    try {
      const res = await fetch(`/api/distance?destination=${encodeURIComponent(address)}`)
      if (res.ok) {
        const data = await res.json()
        setTravelDistanceMiles(String(data.miles))
        setTravelDriveMinutes(String(data.minutes))
      }
    } catch {
      // Silently fail — user can still type manually
    }
    setCalculatingDistance(false)
  }

  // Check admin access and load employees
  useEffect(() => {
    async function init() {
      try {
        const [meRes, empRes] = await Promise.all([
          fetch('/api/employee/me'),
          fetch('/api/employees'),
        ])

        if (meRes.ok) {
          const meData = await meRes.json()
          if (meData.role === 'admin') {
            setIsAdmin(true)
          } else {
            router.replace('/employee/dashboard')
            return
          }
        } else {
          router.replace('/employee')
          return
        }

        if (empRes.ok) {
          const empData = await empRes.json()
          setAllEmployees(empData)
        }
      } catch {
        router.replace('/employee')
        return
      }
      setLoading(false)
    }
    init()
  }, [router])

  // Auto-calculate staffing based on drinks
  useEffect(() => {
    if (!staffingOverride) {
      const drinks = parseInt(numberOfDrinks) || 0
      setStaffing(drinks > 75 ? '2' : '1')
    }
  }, [numberOfDrinks, staffingOverride])

  const toggleEmployee = (empId: string) => {
    setAssignedEmployees(prev =>
      prev.includes(empId)
        ? prev.filter(id => id !== empId)
        : [...prev, empId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!eventDate) {
      setError('Please select an event date.')
      return
    }
    if (!customerName.trim()) {
      setError('Please enter a customer or venue name.')
      return
    }

    setSubmitting(true)

    try {
      const bookingPayload = {
        event_type: eventType,
        custom_event_type: eventType === 'Other' ? customEventType : null,
        event_category: eventCategory,
        customer_name: customerName.trim(),
        phone: customerPhone || null,
        email: customerEmail || null,
        event_date: eventDate,
        event_start_time: eventStartTime,
        event_address: eventAddress,
        contact_name: contactName || null,
        contact_phone: contactPhone || null,
        drink_package: drinkPackage === 'full' ? null : drinkPackage,
        number_of_drinks: numberOfDrinks ? parseInt(numberOfDrinks) : null,
        payment_method: paymentMethod,
        extra_hours: parseInt(extraHours) || 0,
        indoor_outdoor: indoorOutdoor,
        power_available: powerAvailable,
        distance_from_power: powerAvailable === 'yes' ? distanceFromPower : null,
        sink_available: sinkAvailable,
        trash_on_site: trashOnSite,
        travel_distance_miles: parseFloat(travelDistanceMiles) || 0,
        travel_drive_minutes: parseInt(travelDriveMinutes) || 0,
        additional_details: additionalDetails || null,
        assigned_employees: assignedEmployees,
        staffing: parseInt(staffing) || 1,
        status,
      }

      // Create the first (or only) event
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to create event.')
        setSubmitting(false)
        return
      }

      const firstBooking = await res.json()

      // If recurring, create additional events
      if (isRecurring && eventDate) {
        const futureDates = generateRecurringDates(
          eventDate,
          frequency,
          recurringEndDate || null,
          ongoingRecurring
        )

        for (const date of futureDates) {
          try {
            await fetch('/api/admin/bookings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...bookingPayload, event_date: date }),
            })
          } catch {
            console.error('Failed to create recurring event for', date)
          }
        }
      }

      // Go to the first event's detail page
      router.push(`/employee/event/${firstBooking.id}`)
    } catch {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    )
  }

  if (!isAdmin) return null

  const inputClass = 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors text-sm'
  const selectClass = 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors text-sm appearance-none'
  const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5'
  const sectionClass = 'space-y-4'

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800/50">
        <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
          <button
            onClick={() => router.push('/employee/admin')}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-300" />
          </button>
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-amber-400" />
            <h1 className="text-sm font-semibold text-white">Create Event</h1>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="flex-1 px-4 pb-10 max-w-lg mx-auto w-full mt-5">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* ===== SECTION 1: Event Info ===== */}
          <section>
            <h2 className="text-xs font-bold tracking-widest text-amber-400 uppercase mb-4 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              Event Information
            </h2>
            <div className="bg-gray-900 border border-gray-700/50 rounded-2xl p-5">
              <div className={sectionClass}>
                {/* Event type */}
                <div>
                  <label className={labelClass}>Event Type</label>
                  <select
                    value={eventType}
                    onChange={e => setEventType(e.target.value)}
                    className={selectClass}
                  >
                    {EVENT_TYPES.map(t => (
                      <option key={t} value={t} className="bg-gray-900">{t}</option>
                    ))}
                  </select>
                </div>

                {/* Custom event type */}
                {eventType === 'Other' && (
                  <div>
                    <label className={labelClass}>Custom Event Type</label>
                    <input
                      type="text"
                      value={customEventType}
                      onChange={e => setCustomEventType(e.target.value)}
                      placeholder="e.g. Graduation Party"
                      className={inputClass}
                    />
                  </div>
                )}

                {/* Event category toggle */}
                <div>
                  <label className={labelClass}>Event Category</label>
                  <div className="flex bg-white/5 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => setEventCategory('private')}
                      className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                        eventCategory === 'private'
                          ? 'bg-amber-500 text-gray-950'
                          : 'text-white/60 hover:text-white/80'
                      }`}
                    >
                      Private
                    </button>
                    <button
                      type="button"
                      onClick={() => setEventCategory('public')}
                      className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                        eventCategory === 'public'
                          ? 'bg-amber-500 text-gray-950'
                          : 'text-white/60 hover:text-white/80'
                      }`}
                    >
                      Public
                    </button>
                  </div>
                </div>

                {/* Customer / Venue name */}
                <div>
                  <label className={labelClass}>
                    {eventCategory === 'public' ? 'Venue Name' : 'Customer Name'}
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder={eventCategory === 'public' ? 'e.g. Downtown Farmers Market' : 'e.g. Sarah Johnson'}
                    className={inputClass}
                    required
                  />
                </div>

                {/* Customer phone (optional) */}
                <div>
                  <label className={labelClass}>Customer Phone <span className="text-gray-500">(optional)</span></label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className={inputClass}
                  />
                </div>

                {/* Customer email (optional) */}
                <div>
                  <label className={labelClass}>Customer Email <span className="text-gray-500">(optional)</span></label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    placeholder="customer@email.com"
                    className={inputClass}
                  />
                </div>

                {/* Event date */}
                <div>
                  <label className={labelClass}>Event Date</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={e => setEventDate(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>

                {/* Event start time */}
                <div>
                  <label className={labelClass}>Start Time</label>
                  <select
                    value={eventStartTime}
                    onChange={e => setEventStartTime(e.target.value)}
                    className={selectClass}
                  >
                    {TIME_OPTIONS.map(t => (
                      <option key={t} value={t} className="bg-gray-900">{t}</option>
                    ))}
                  </select>
                </div>

                {/* Event address */}
                <div>
                  <label className={labelClass}>Event Address</label>
                  <input
                    type="text"
                    value={eventAddress}
                    onChange={e => setEventAddress(e.target.value)}
                    onBlur={e => calculateDistance(e.target.value)}
                    placeholder="123 Main St, City, State"
                    className={inputClass}
                  />
                  {calculatingDistance && (
                    <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Calculating distance from shop...
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ===== SECTION 2: Contact ===== */}
          <section>
            <h2 className="text-xs font-bold tracking-widest text-amber-400 uppercase mb-4">
              Day-of Contact
            </h2>
            <div className="bg-gray-900 border border-gray-700/50 rounded-2xl p-5">
              <div className={sectionClass}>
                <div>
                  <label className={labelClass}>Contact Name</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    placeholder="On-site contact person"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Contact Phone</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ===== SECTION 3: Service Details ===== */}
          <section>
            <h2 className="text-xs font-bold tracking-widest text-amber-400 uppercase mb-4">
              Service Details
            </h2>
            <div className="bg-gray-900 border border-gray-700/50 rounded-2xl p-5">
              <div className={sectionClass}>
                {/* Package */}
                <div>
                  <label className={labelClass}>Package</label>
                  <select
                    value={drinkPackage}
                    onChange={e => setDrinkPackage(e.target.value)}
                    className={selectClass}
                  >
                    {PACKAGES.map(p => (
                      <option key={p.value} value={p.value} className="bg-gray-900">{p.label}</option>
                    ))}
                  </select>
                </div>

                {/* Number of drinks */}
                <div>
                  <label className={labelClass}>Number of Drinks <span className="text-gray-500">(optional)</span></label>
                  <input
                    type="number"
                    value={numberOfDrinks}
                    onChange={e => setNumberOfDrinks(e.target.value)}
                    placeholder="Leave blank for default"
                    className={inputClass}
                    min="0"
                  />
                </div>

                {/* Payment method */}
                <div>
                  <label className={labelClass}>Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    className={selectClass}
                  >
                    {PAYMENT_METHODS.map(p => (
                      <option key={p.value} value={p.value} className="bg-gray-900">{p.label}</option>
                    ))}
                  </select>
                </div>

                {/* Extra hours */}
                <div>
                  <label className={labelClass}>Extra Hours</label>
                  <select
                    value={extraHours}
                    onChange={e => setExtraHours(e.target.value)}
                    className={selectClass}
                  >
                    {[0, 1, 2, 3, 4, 5, 6].map(h => (
                      <option key={h} value={h.toString()} className="bg-gray-900">{h} hour{h !== 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* ===== SECTION 4: Venue Details ===== */}
          <section>
            <h2 className="text-xs font-bold tracking-widest text-amber-400 uppercase mb-4">
              Venue Details
            </h2>
            <div className="bg-gray-900 border border-gray-700/50 rounded-2xl p-5">
              <div className={sectionClass}>
                {/* Indoor/Outdoor */}
                <div>
                  <label className={labelClass}>Indoor / Outdoor</label>
                  <div className="flex bg-white/5 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => setIndoorOutdoor('indoor')}
                      className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                        indoorOutdoor === 'indoor'
                          ? 'bg-amber-500 text-gray-950'
                          : 'text-white/60 hover:text-white/80'
                      }`}
                    >
                      Indoor
                    </button>
                    <button
                      type="button"
                      onClick={() => setIndoorOutdoor('outdoor')}
                      className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                        indoorOutdoor === 'outdoor'
                          ? 'bg-amber-500 text-gray-950'
                          : 'text-white/60 hover:text-white/80'
                      }`}
                    >
                      Outdoor
                    </button>
                  </div>
                </div>

                {/* Power */}
                <div>
                  <label className={labelClass}>Power Available</label>
                  <div className="flex bg-white/5 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => setPowerAvailable('yes')}
                      className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                        powerAvailable === 'yes'
                          ? 'bg-amber-500 text-gray-950'
                          : 'text-white/60 hover:text-white/80'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setPowerAvailable('no')}
                      className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                        powerAvailable === 'no'
                          ? 'bg-amber-500 text-gray-950'
                          : 'text-white/60 hover:text-white/80'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {/* Distance from power */}
                {powerAvailable === 'yes' && (
                  <div>
                    <label className={labelClass}>Distance from Power <span className="text-gray-500">(optional)</span></label>
                    <input
                      type="text"
                      value={distanceFromPower}
                      onChange={e => setDistanceFromPower(e.target.value)}
                      placeholder="e.g. 50 feet"
                      className={inputClass}
                    />
                  </div>
                )}

                {/* Sink */}
                <div>
                  <label className={labelClass}>Sink Available</label>
                  <div className="flex bg-white/5 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => setSinkAvailable('yes')}
                      className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                        sinkAvailable === 'yes'
                          ? 'bg-amber-500 text-gray-950'
                          : 'text-white/60 hover:text-white/80'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setSinkAvailable('no')}
                      className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                        sinkAvailable === 'no'
                          ? 'bg-amber-500 text-gray-950'
                          : 'text-white/60 hover:text-white/80'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {/* Trash */}
                <div>
                  <label className={labelClass}>Trash on Site</label>
                  <div className="flex bg-white/5 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => setTrashOnSite('yes')}
                      className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                        trashOnSite === 'yes'
                          ? 'bg-amber-500 text-gray-950'
                          : 'text-white/60 hover:text-white/80'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setTrashOnSite('no')}
                      className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                        trashOnSite === 'no'
                          ? 'bg-amber-500 text-gray-950'
                          : 'text-white/60 hover:text-white/80'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ===== SECTION 5: Travel ===== */}
          <section>
            <h2 className="text-xs font-bold tracking-widest text-amber-400 uppercase mb-4">
              Travel
            </h2>
            <div className="bg-gray-900 border border-gray-700/50 rounded-2xl p-5">
              {travelDistanceMiles && travelDriveMinutes && (
                <p className="text-xs text-gray-400 mb-3">
                  Auto-calculated from shop. You can edit if needed.
                </p>
              )}
              <div className={sectionClass}>
                <div>
                  <label className={labelClass}>Distance (miles)</label>
                  <input
                    type="number"
                    value={travelDistanceMiles}
                    onChange={e => setTravelDistanceMiles(e.target.value)}
                    placeholder="One-way miles"
                    className={inputClass}
                    min="0"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className={labelClass}>Drive Time (minutes)</label>
                  <input
                    type="number"
                    value={travelDriveMinutes}
                    onChange={e => setTravelDriveMinutes(e.target.value)}
                    placeholder="One-way drive time"
                    className={inputClass}
                    min="0"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ===== SECTION 6: Notes ===== */}
          <section>
            <h2 className="text-xs font-bold tracking-widest text-amber-400 uppercase mb-4">
              Additional Details
            </h2>
            <div className="bg-gray-900 border border-gray-700/50 rounded-2xl p-5">
              <textarea
                value={additionalDetails}
                onChange={e => setAdditionalDetails(e.target.value)}
                placeholder="Any special requests, notes, or details..."
                rows={4}
                className={`${inputClass} resize-none`}
              />
            </div>
          </section>

          {/* ===== SECTION 7: Staffing & Assignment ===== */}
          <section>
            <h2 className="text-xs font-bold tracking-widest text-amber-400 uppercase mb-4">
              Staffing & Assignment
            </h2>
            <div className="bg-gray-900 border border-gray-700/50 rounded-2xl p-5">
              <div className={sectionClass}>
                {/* Staffing */}
                <div>
                  <label className={labelClass}>
                    Staffing
                    {!staffingOverride && numberOfDrinks && (
                      <span className="text-gray-500 font-normal"> (auto: {parseInt(numberOfDrinks) > 75 ? '2' : '1'} person{parseInt(numberOfDrinks) > 75 ? 's' : ''})</span>
                    )}
                  </label>
                  <div className="flex items-center gap-3">
                    <select
                      value={staffing}
                      onChange={e => {
                        setStaffing(e.target.value)
                        setStaffingOverride(true)
                      }}
                      className={`${selectClass} flex-1`}
                    >
                      <option value="1" className="bg-gray-900">1 Person</option>
                      <option value="2" className="bg-gray-900">2 People</option>
                    </select>
                    {staffingOverride && (
                      <button
                        type="button"
                        onClick={() => setStaffingOverride(false)}
                        className="text-xs text-amber-400 underline"
                      >
                        Auto
                      </button>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className={labelClass}>Status</label>
                  <div className="flex bg-white/5 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => setStatus('pending')}
                      className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                        status === 'pending'
                          ? 'bg-amber-500 text-gray-950'
                          : 'text-white/60 hover:text-white/80'
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('confirmed')}
                      className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                        status === 'confirmed'
                          ? 'bg-amber-500 text-gray-950'
                          : 'text-white/60 hover:text-white/80'
                      }`}
                    >
                      Confirmed
                    </button>
                  </div>
                </div>

                {/* Assign employees */}
                <div>
                  <label className={labelClass}>Assign to Employees</label>
                  <div className="space-y-1 mt-1">
                    {allEmployees.map(emp => (
                      <label
                        key={emp.id}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={assignedEmployees.includes(emp.id)}
                          onChange={() => toggleEmployee(emp.id)}
                          className="w-4 h-4 rounded border-white/20 bg-white/10 text-amber-500 focus:ring-amber-500/50 accent-amber-500"
                        />
                        <span className="text-sm text-gray-200">{emp.name}</span>
                      </label>
                    ))}
                    {allEmployees.length === 0 && (
                      <p className="text-sm text-gray-500 px-3 py-2">No employees found</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ===== SECTION 8: Recurring ===== */}
          <section>
            <h2 className="text-xs font-bold tracking-widest text-amber-400 uppercase mb-4 flex items-center gap-2">
              <Repeat className="w-3.5 h-3.5" />
              Recurring Event
            </h2>
            <div className="bg-gray-900 border border-gray-700/50 rounded-2xl p-5">
              <div className={sectionClass}>
                {/* Recurring toggle */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setIsRecurring(!isRecurring)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      isRecurring ? 'bg-amber-500' : 'bg-white/10'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                        isRecurring ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                  <span className="text-sm text-gray-200">This is a recurring event</span>
                </label>

                {isRecurring && (
                  <>
                    {/* Frequency */}
                    <div>
                      <label className={labelClass}>Frequency</label>
                      <select
                        value={frequency}
                        onChange={e => setFrequency(e.target.value)}
                        className={selectClass}
                      >
                        {FREQUENCY_OPTIONS.map(f => (
                          <option key={f.value} value={f.value} className="bg-gray-900">{f.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Ongoing toggle */}
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div
                        onClick={() => setOngoingRecurring(!ongoingRecurring)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          ongoingRecurring ? 'bg-amber-500' : 'bg-white/10'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                            ongoingRecurring ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </div>
                      <span className="text-sm text-gray-200">Ongoing (3 months out)</span>
                    </label>

                    {/* End date (if not ongoing) */}
                    {!ongoingRecurring && (
                      <div>
                        <label className={labelClass}>End Date</label>
                        <input
                          type="date"
                          value={recurringEndDate}
                          onChange={e => setRecurringEndDate(e.target.value)}
                          className={inputClass}
                          min={eventDate}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-2xl text-base font-bold transition-all duration-200 bg-gradient-to-r from-amber-500 to-amber-600 text-gray-950 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Event...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Create Event
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  )
}
