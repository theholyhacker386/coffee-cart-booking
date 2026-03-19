'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Loader2, Shield, Car, Calendar } from 'lucide-react'

interface Employee {
  id: string
  name: string
}

interface MileageEntry {
  id: string
  event_date: string
  customer_name: string
  event_type: string
  custom_event_type?: string | null
  travel_distance_miles: number | null
}

export default function MileagePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [entries, setEntries] = useState<MileageEntry[]>([])
  const [searching, setSearching] = useState(false)

  // Default dates: start of current month to today
  useEffect(() => {
    const now = new Date()
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    setStartDate(firstOfMonth.toISOString().split('T')[0])
    setEndDate(now.toISOString().split('T')[0])
  }, [])

  // Check admin role and load employees
  useEffect(() => {
    async function init() {
      try {
        const meRes = await fetch('/api/employee/me')
        if (meRes.ok) {
          const me = await meRes.json()
          if (me.role !== 'admin') {
            router.replace('/employee/dashboard')
            return
          }
          setIsAdmin(true)
        } else {
          router.replace('/employee')
          return
        }

        const empRes = await fetch('/api/admin/employees')
        if (empRes.ok) {
          const empData = await empRes.json()
          setEmployees(empData)
        }
      } catch {
        router.replace('/employee')
        return
      }
      setLoading(false)
    }
    init()
  }, [router])

  async function handleSearch() {
    if (!selectedEmployee || !startDate || !endDate) return
    setSearching(true)
    try {
      const res = await fetch(
        `/api/admin/mileage?employeeId=${selectedEmployee}&startDate=${startDate}&endDate=${endDate}`
      )
      if (res.ok) {
        const data = await res.json()
        setEntries(data)
      }
    } catch {
      // ignore
    } finally {
      setSearching(false)
    }
  }

  // Calculate totals
  const totalOneway = entries.reduce((sum, e) => sum + (e.travel_distance_miles || 0), 0)
  const totalRoundTrip = totalOneway * 2
  const totalReimbursement = totalRoundTrip * 0.725

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    )
  }

  if (!isAdmin) return null

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
          <div className="flex items-center gap-2">
            <Image
              src="/the porch coffe bar logo.png"
              alt="The Porch Coffee Bar"
              width={28}
              height={28}
              className="rounded-full"
            />
            <div className="flex items-center gap-1.5">
              <Car className="w-4 h-4 text-amber-400" />
              <h1 className="text-sm font-semibold text-white">Mileage Report</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 pb-8 max-w-lg mx-auto w-full mt-6 space-y-5">
        {/* Employee selector */}
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 block">Employee</label>
          <select
            value={selectedEmployee}
            onChange={e => setSelectedEmployee(e.target.value)}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 text-sm appearance-none"
          >
            <option value="" className="bg-gray-900">Select employee...</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id} className="bg-gray-900">{emp.name}</option>
            ))}
          </select>
        </div>

        {/* Date range */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 block">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 block">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 text-sm"
            />
          </div>
        </div>

        {/* Search button */}
        <button
          onClick={handleSearch}
          disabled={!selectedEmployee || !startDate || !endDate || searching}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-amber-500 text-gray-950 hover:bg-amber-400 active:scale-[0.98] disabled:opacity-50 transition-all"
        >
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Car className="w-4 h-4" />}
          {searching ? 'Searching...' : 'Get Mileage'}
        </button>

        {/* Results */}
        {entries.length > 0 && (
          <>
            {/* Summary card */}
            <div className="bg-gray-900 border border-gray-700/50 rounded-2xl p-5">
              <h3 className="text-xs font-bold tracking-widest text-amber-400 uppercase mb-4">
                Mileage Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Events</span>
                  <span className="text-white font-mono">{entries.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Round-Trip Miles</span>
                  <span className="text-white font-mono">{totalRoundTrip.toFixed(1)} mi</span>
                </div>
                <div className="h-px bg-gray-700 my-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300 font-medium">Total Reimbursement</span>
                  <span className="text-emerald-400 font-bold font-mono">${totalReimbursement.toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">Based on IRS rate of $0.725/mile</p>
              </div>
            </div>

            {/* Individual events */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase">
                Event Breakdown
              </h3>
              {entries.map(entry => {
                const roundTrip = (entry.travel_distance_miles || 0) * 2
                const eventType = entry.custom_event_type || entry.event_type || 'Event'
                const date = new Date(entry.event_date + 'T00:00:00')
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                return (
                  <div key={entry.id} className="bg-gray-900 border border-gray-700/50 rounded-xl px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">{entry.customer_name}</p>
                      <p className="text-xs text-gray-500">{dateStr} &middot; {eventType}</p>
                    </div>
                    <span className="text-sm text-gray-300 font-mono">{roundTrip.toFixed(1)} mi</span>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* No results state */}
        {!searching && entries.length === 0 && selectedEmployee && (
          <div className="text-center py-10">
            <Car className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Select an employee and date range, then tap &quot;Get Mileage&quot;</p>
          </div>
        )}
      </main>
    </div>
  )
}
