'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Clock, Play, Square, Timer, Loader2 } from 'lucide-react'

interface TimeEntry {
  id: string
  booking_id: string
  employee_id: string
  clock_in: string
  clock_out: string | null
  created_at: string
  cc_employees?: { name: string }
}

interface TimeClockProps {
  bookingId: string
  employeeId: string
  employeeName: string
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const pad = (n: number) => n.toString().padStart(2, '0')

  if (hours > 0) {
    return `${hours}h ${pad(minutes)}m ${pad(seconds)}s`
  }
  return `${pad(minutes)}m ${pad(seconds)}s`
}

function formatDurationShort(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

export default function TimeClock({ bookingId, employeeId, employeeName }: TimeClockProps) {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Find the current open entry for this employee
  const openEntry = entries.find(
    (e) => e.employee_id === employeeId && !e.clock_out
  )

  // All completed entries for this employee
  const completedEntries = entries.filter(
    (e) => e.employee_id === employeeId && e.clock_out
  )

  // Fetch time entries
  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/time`)
      if (res.ok) {
        const data = await res.json()
        setEntries(data)
      } else {
        setError('Could not load time clock data')
      }
    } catch {
      setError('Network error loading time clock')
    } finally {
      setLoading(false)
    }
  }, [bookingId])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  // Live timer when clocked in
  useEffect(() => {
    if (openEntry) {
      const clockInTime = new Date(openEntry.clock_in).getTime()

      const updateElapsed = () => {
        setElapsed(Date.now() - clockInTime)
      }

      updateElapsed()
      timerRef.current = setInterval(updateElapsed, 1000)

      return () => {
        if (timerRef.current) clearInterval(timerRef.current)
      }
    } else {
      setElapsed(0)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [openEntry])

  // Clock in handler
  const handleClockIn = async () => {
    setActionLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/bookings/${bookingId}/time`, {
        method: 'POST',
      })
      if (res.ok) {
        await fetchEntries()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to clock in')
      }
    } catch {
      setError('Network error')
    } finally {
      setActionLoading(false)
    }
  }

  // Clock out handler
  const handleClockOut = async () => {
    setActionLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/bookings/${bookingId}/time`, {
        method: 'PATCH',
      })
      if (res.ok) {
        await fetchEntries()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to clock out')
      }
    } catch {
      setError('Network error')
    } finally {
      setActionLoading(false)
    }
  }

  // Calculate total time worked from completed entries
  const totalWorkedMs = completedEntries.reduce((acc, entry) => {
    const clockIn = new Date(entry.clock_in).getTime()
    const clockOut = new Date(entry.clock_out!).getTime()
    return acc + (clockOut - clockIn)
  }, 0)

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-700/50 rounded-2xl p-5">
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
        </div>
      </div>
    )
  }

  const isClockedIn = !!openEntry

  return (
    <div className="bg-gray-900 border border-gray-700/50 rounded-2xl p-5">
      {/* Status display */}
      <div className="text-center mb-5">
        {isClockedIn ? (
          <>
            {/* Clocked in - show live timer */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="relative">
                <Clock className="w-5 h-5 text-amber-400" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              </div>
              <span className="text-sm text-amber-400 font-medium">
                Clocked in at {formatTime(openEntry.clock_in)}
              </span>
            </div>
            <div className="text-3xl font-bold text-white font-mono tracking-wider">
              {formatDuration(elapsed)}
            </div>
          </>
        ) : completedEntries.length > 0 ? (
          <>
            {/* Has completed shifts */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <Timer className="w-5 h-5 text-emerald-400" />
              <span className="text-sm text-emerald-400 font-medium">
                Shift complete
              </span>
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {formatDurationShort(totalWorkedMs)} worked
            </div>
          </>
        ) : (
          <>
            {/* Not yet clocked in */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-400">
                Not clocked in
              </span>
            </div>
            <p className="text-xs text-gray-500">{employeeName}</p>
          </>
        )}
      </div>

      {/* Clock in/out button */}
      <button
        onClick={isClockedIn ? handleClockOut : handleClockIn}
        disabled={actionLoading}
        className={`
          w-full py-4 rounded-2xl text-base font-bold transition-all duration-200
          flex items-center justify-center gap-3
          active:scale-[0.97] disabled:opacity-50
          ${isClockedIn
            ? 'bg-amber-500/20 text-amber-300 border-2 border-amber-500/40 hover:bg-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
            : 'bg-emerald-500/20 text-emerald-300 border-2 border-emerald-500/40 hover:bg-emerald-500/30'
          }
        `}
      >
        {actionLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isClockedIn ? (
          <>
            <Square className="w-5 h-5" />
            Clock Out
          </>
        ) : (
          <>
            <Play className="w-5 h-5" />
            Clock In
          </>
        )}
      </button>

      {/* Error display */}
      {error && (
        <p className="text-xs text-red-400 text-center mt-3">{error}</p>
      )}

      {/* Shift history */}
      {completedEntries.length > 0 && (
        <div className="mt-5 pt-4 border-t border-gray-800">
          <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-2">
            Shift History
          </p>
          <div className="space-y-2">
            {completedEntries.map((entry) => {
              const clockIn = new Date(entry.clock_in).getTime()
              const clockOut = new Date(entry.clock_out!).getTime()
              const duration = clockOut - clockIn

              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between text-xs text-gray-400"
                >
                  <span>
                    {formatTime(entry.clock_in)} - {formatTime(entry.clock_out!)}
                  </span>
                  <span className="font-mono text-gray-300">
                    {formatDurationShort(duration)}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Total */}
          {completedEntries.length > 1 && (
            <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-gray-800">
              <span className="text-gray-400 font-medium">Total</span>
              <span className="font-mono text-amber-400 font-medium">
                {formatDurationShort(totalWorkedMs)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
