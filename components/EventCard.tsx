'use client'

import Link from 'next/link'
import { Calendar, Coffee, User, Clock } from 'lucide-react'
import ChecklistProgress from './ChecklistProgress'

interface EventCardProps {
  id: string
  eventDate: string
  eventType: string
  customEventType?: string | null
  customerName: string
  drinkPackage: string | null
  eventCategory: string
  status: string
  checklistTotal: number
  checklistCompleted: number
}

/** Map drink package codes to friendly display names */
function getPackageName(drinkPackage: string | null | undefined): string {
  switch (drinkPackage) {
    case 'drip':
      return 'Drip Coffee'
    case 'standard':
      return 'Standard Espresso'
    case 'premium':
      return 'Premium Espresso'
    case 'kombucha':
      return 'Kombucha Bar'
    case 'hotchoc':
      return 'Hot Chocolate Bar'
    default:
      return 'Public Event'
  }
}

/** Format a date string like "2026-02-20" to "Sat, Feb 20" */
function formatEventDate(dateStr: string): string {
  // Use noon to avoid timezone issues
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

/** Get display text for event type, using custom type if event type is "Other" */
function getEventTypeName(eventType: string, customEventType?: string | null): string {
  if (eventType === 'Other' && customEventType) {
    return customEventType
  }
  return eventType || 'Event'
}

export default function EventCard({
  id,
  eventDate,
  eventType,
  customEventType,
  customerName,
  drinkPackage,
  eventCategory,
  status,
  checklistTotal,
  checklistCompleted,
}: EventCardProps) {
  const displayDate = formatEventDate(eventDate)
  const displayEventType = getEventTypeName(eventType, customEventType)
  const displayPackage = getPackageName(drinkPackage)

  return (
    <Link
      href={`/employee/event/${id}`}
      className="block bg-gray-800/80 border border-gray-700/50 rounded-2xl p-4 sm:p-5 hover:border-amber-500/30 hover:bg-gray-800 transition-all duration-200 active:scale-[0.98]"
    >
      {/* Top row: date + status badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-amber-400">{displayDate}</span>
        </div>
        {status === 'pending' && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            Pending Approval
          </span>
        )}
      </div>

      {/* Event type */}
      <h3 className="text-lg font-semibold text-white mb-1">{displayEventType}</h3>

      {/* Customer name */}
      <div className="flex items-center gap-2 mb-1">
        <User className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-sm text-gray-300">{customerName || 'Unknown'}</span>
      </div>

      {/* Package */}
      <div className="flex items-center gap-2 mb-4">
        <Coffee className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-sm text-gray-400">
          {eventCategory === 'public' ? 'Public Event' : displayPackage}
        </span>
      </div>

      {/* Checklist progress */}
      <ChecklistProgress completed={checklistCompleted} total={checklistTotal} />
    </Link>
  )
}
