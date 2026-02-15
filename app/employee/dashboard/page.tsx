'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { LogOut, Loader2, CalendarX, Settings } from 'lucide-react'
import EventCard from '@/components/EventCard'
import AddToHomeScreenPopup from '@/components/AddToHomeScreenPopup'
import NotificationPermissionPopup from '@/components/NotificationPermissionPopup'

type FilterTab = 'upcoming' | 'past'
type AssignmentFilter = 'all' | 'mine'

interface Booking {
  id: string
  event_date: string
  event_type: string
  custom_event_type?: string | null
  customer_name: string
  drink_package: string | null
  event_category: string
  status: string
  checklist_total: number
  checklist_completed: number
  staffing?: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<FilterTab>('upcoming')
  const [assignmentFilter, setAssignmentFilter] = useState<AssignmentFilter>('all')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [employeeName, setEmployeeName] = useState('')
  const [loggingOut, setLoggingOut] = useState(false)

  // Fetch the employee's name from the session
  useEffect(() => {
    async function fetchEmployee() {
      try {
        const res = await fetch('/api/employee/me')
        if (res.ok) {
          const data = await res.json()
          setEmployeeName(data.name || '')
        }
      } catch {
        // If we can't get the name, that's okay — the header just won't show it
      }
    }
    fetchEmployee()
  }, [])

  // Fetch bookings whenever the active tab or assignment filter changes
  const fetchBookings = useCallback(async (filter: FilterTab, assignment: AssignmentFilter) => {
    setLoading(true)
    try {
      let url = `/api/bookings?filter=${filter}`
      if (assignment === 'mine') url += '&assigned=true'
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setBookings(data)
      } else {
        setBookings([])
      }
    } catch {
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBookings(activeTab, assignmentFilter)
  }, [activeTab, assignmentFilter, fetchBookings])

  // Handle logout
  async function handleLogout() {
    setLoggingOut(true)
    try {
      await fetch('/api/employee/logout', { method: 'POST' })
      router.push('/employee')
    } catch {
      setLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Add to Home Screen popup (mobile only, first visit) */}
      <AddToHomeScreenPopup />
      {/* Notification permission request (shows after A2HS is dismissed) */}
      <NotificationPermissionPopup />

      {/* Header */}
      <header className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800/50">
        <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
          {/* Logo + brand */}
          <div className="flex items-center gap-3">
            <Image
              src="/the porch coffe bar logo.png"
              alt="The Porch Coffee Bar"
              width={36}
              height={36}
              className="rounded-full"
            />
            <div>
              <h1 className="text-sm font-serif text-white leading-tight">The Porch</h1>
              {employeeName && (
                <p className="text-xs text-gray-400">Hi, {employeeName}</p>
              )}
            </div>
          </div>

          {/* Settings + Logout buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => router.push('/employee/settings')}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              {loggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 pb-8 max-w-lg mx-auto w-full">
        {/* Tab buttons */}
        <div className="flex bg-white/5 rounded-xl p-1 my-5">
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === 'upcoming'
                ? 'bg-amber-500 text-gray-950'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            Upcoming
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === 'past'
                ? 'bg-amber-500 text-gray-950'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            Past
          </button>
        </div>

        {/* Assignment filter */}
        <div className="flex bg-white/5 rounded-lg p-0.5 mb-4">
          <button
            type="button"
            onClick={() => setAssignmentFilter('all')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
              assignmentFilter === 'all'
                ? 'bg-white/10 text-white'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            All Events
          </button>
          <button
            type="button"
            onClick={() => setAssignmentFilter('mine')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
              assignmentFilter === 'mine'
                ? 'bg-white/10 text-white'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            My Events
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-3" />
            <p className="text-sm text-gray-400">Loading events...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && bookings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CalendarX className="w-12 h-12 text-gray-600 mb-4" />
            <h2 className="text-lg font-medium text-gray-300 mb-1">
              {activeTab === 'upcoming' ? 'No upcoming events' : 'No past events yet'}
            </h2>
            <p className="text-sm text-gray-500">
              {activeTab === 'upcoming'
                ? 'When new bookings come in, they\'ll show up here.'
                : 'Completed events will appear here.'}
            </p>
          </div>
        )}

        {/* Event cards list */}
        {!loading && bookings.length > 0 && (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <EventCard
                key={booking.id}
                id={booking.id}
                eventDate={booking.event_date}
                eventType={booking.event_type || ''}
                customEventType={booking.custom_event_type}
                customerName={booking.customer_name || 'Unknown'}
                drinkPackage={booking.drink_package}
                eventCategory={booking.event_category || 'private'}
                status={booking.status || 'pending'}
                checklistTotal={booking.checklist_total}
                checklistCompleted={booking.checklist_completed}
                staffing={booking.staffing}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
