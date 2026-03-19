'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarEvent {
  id: string
  event_date: string
  customer_name: string
  event_type: string
  custom_event_type?: string | null
}

interface EventCalendarProps {
  events: CalendarEvent[]
}

export default function EventCalendar({ events }: EventCalendarProps) {
  const router = useRouter()
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  // Build a map of date -> events
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {}
    for (const event of events) {
      const dateKey = event.event_date
      if (!map[dateKey]) map[dateKey] = []
      map[dateKey].push(event)
    }
    return map
  }, [events])

  // Calendar grid calculations
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const startDay = firstDayOfMonth.getDay() // 0=Sun
  const daysInMonth = lastDayOfMonth.getDate()

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  function prevMonth() {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  function nextMonth() {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  // Build calendar cells
  const cells = []
  // Empty cells before first day
  for (let i = 0; i < startDay; i++) {
    cells.push(<div key={`empty-${i}`} className="h-10" />)
  }
  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const dayEvents = eventsByDate[dateStr] || []
    const isToday = dateStr === todayStr
    const hasEvents = dayEvents.length > 0

    cells.push(
      <button
        key={day}
        onClick={() => {
          if (dayEvents.length === 1) {
            router.push(`/employee/event/${dayEvents[0].id}`)
          } else if (dayEvents.length > 1) {
            // Show first event — could expand to a list later
            router.push(`/employee/event/${dayEvents[0].id}`)
          }
        }}
        disabled={!hasEvents}
        className={`h-10 rounded-lg text-xs font-medium relative flex items-center justify-center transition-all
          ${isToday ? 'ring-1 ring-amber-500/50' : ''}
          ${hasEvents
            ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 active:scale-95 cursor-pointer'
            : 'text-gray-500 cursor-default'
          }
        `}
      >
        {day}
        {hasEvents && (
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
            {dayEvents.slice(0, 3).map((_, i) => (
              <span key={i} className="w-1 h-1 rounded-full bg-amber-400" />
            ))}
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="bg-gray-900 border border-gray-700/50 rounded-2xl p-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-gray-400" />
        </button>
        <span className="text-sm font-medium text-white">{monthLabel}</span>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-center text-[10px] text-gray-500 font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells}
      </div>
    </div>
  )
}
