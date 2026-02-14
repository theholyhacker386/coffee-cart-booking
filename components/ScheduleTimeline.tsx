'use client'

import React from 'react'

interface ScheduleTimelineProps {
  eventStartTime: string       // e.g. "2:00 PM" or "14:00"
  extraHours: number           // 0-6, additional service hours beyond base 2
  travelDriveMinutes: number   // one-way drive time in minutes
  eventDate: string            // for display, e.g. "2026-02-20"
}

// ---------- Time helpers ----------

/** Parse a 12-hour string like "2:00 PM" into total minutes since midnight. */
function parseTime(timeStr: string): number {
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return 0

  let hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const period = match[3].toUpperCase()

  // Convert 12-hour to 24-hour for math
  if (period === 'AM' && hours === 12) hours = 0
  if (period === 'PM' && hours !== 12) hours += 12

  return hours * 60 + minutes
}

/** Convert total minutes since midnight back to "h:mm AM/PM" format. */
function formatTime(totalMinutes: number): string {
  // Handle negative values (wraps to previous day — unlikely but safe)
  let mins = ((totalMinutes % 1440) + 1440) % 1440

  let hours = Math.floor(mins / 60)
  const minutes = mins % 60
  const period = hours >= 12 ? 'PM' : 'AM'

  // Convert from 24-hour back to 12-hour
  if (hours === 0) hours = 12
  else if (hours > 12) hours -= 12

  return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`
}

/** Format a date string like "2026-02-20" to a friendly display like "Friday, Feb 20, 2026". */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00') // noon to avoid timezone issues
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function ScheduleTimeline({
  eventStartTime,
  extraHours,
  travelDriveMinutes,
  eventDate,
}: ScheduleTimelineProps) {
  // ----- Calculate all milestones (in minutes since midnight) -----
  const startServingMin = parseTime(eventStartTime)
  const serviceEndsMin = startServingMin + (2 + extraHours) * 60
  const arriveEventMin = startServingMin - 30              // 30 min setup
  const leaveShopMin = arriveEventMin - travelDriveMinutes // drive to event
  const arriveShopMin = leaveShopMin - 20                  // 20 min to load cart

  // ----- Build milestone list -----
  const milestones: {
    time: string
    label: string
    duration: string
    isKey: boolean
  }[] = [
    {
      time: formatTime(arriveShopMin),
      label: 'Arrive at shop',
      duration: '20 min to load up',
      isKey: false,
    },
    {
      time: formatTime(leaveShopMin),
      label: 'Leave shop',
      duration: `~${travelDriveMinutes} min drive`,
      isKey: false,
    },
    {
      time: formatTime(arriveEventMin),
      label: 'Arrive at event',
      duration: '30 min setup',
      isKey: false,
    },
    {
      time: formatTime(startServingMin),
      label: 'Start serving',
      duration: `${2 + extraHours} hr${2 + extraHours !== 1 ? 's' : ''} service`,
      isKey: true,
    },
    {
      time: formatTime(serviceEndsMin),
      label: 'Service ends',
      duration: '',
      isKey: false,
    },
  ]

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-xs font-bold tracking-widest text-amber-400 uppercase mb-1">
          Schedule
        </h3>
        {eventDate && (
          <p className="text-sm text-gray-400">{formatDate(eventDate)}</p>
        )}
        <div className="mt-2 h-px bg-gradient-to-r from-amber-500/60 to-transparent" />
      </div>

      {/* Timeline */}
      <div className="relative pl-2">
        {milestones.map((m, i) => {
          const isLast = i === milestones.length - 1

          return (
            <div key={i} className="relative flex items-start">
              {/* Vertical connector line (not on last item) */}
              {!isLast && (
                <div
                  className="absolute left-[7px] top-[18px] w-px bg-gray-600"
                  style={{ height: 'calc(100% - 2px)' }}
                />
              )}

              {/* Dot */}
              <div className="relative z-10 flex-shrink-0 mt-[5px]">
                {m.isKey ? (
                  /* Filled dot for "Start serving" */
                  <div className="w-[15px] h-[15px] rounded-full bg-amber-400 ring-2 ring-amber-400/30" />
                ) : (
                  /* Open dot for other milestones */
                  <div className="w-[15px] h-[15px] rounded-full border-2 border-gray-400 bg-gray-900" />
                )}
              </div>

              {/* Content */}
              <div className={`ml-4 ${isLast ? 'pb-0' : 'pb-5'}`}>
                {/* Time + Label */}
                <div className="flex items-baseline gap-3">
                  <span
                    className={`text-sm font-mono font-semibold ${
                      m.isKey ? 'text-amber-400' : 'text-gray-200'
                    }`}
                  >
                    {m.time}
                  </span>
                  <span
                    className={`text-sm ${
                      m.isKey
                        ? 'text-amber-300 font-semibold'
                        : 'text-gray-300'
                    }`}
                  >
                    {m.label}
                  </span>
                </div>

                {/* Duration label between milestones */}
                {m.duration && (
                  <p className="text-xs text-gray-500 mt-1 ml-0.5 italic">
                    {m.duration}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
