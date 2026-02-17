'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Shield, ArrowLeft, Loader2, Users, ShieldCheck, User } from 'lucide-react'

interface Employee {
  id: string
  name: string
  role: string
  created_at: string
}

export default function TeamManagementPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      try {
        // Check admin role
        const meRes = await fetch('/api/employee/me')
        if (!meRes.ok) { router.replace('/employee'); return }
        const me = await meRes.json()
        if (me.role !== 'admin') { router.replace('/employee/dashboard'); return }
        setIsAdmin(true)

        // Fetch all employees
        const empRes = await fetch('/api/employees?include_role=true')
        if (empRes.ok) {
          const data = await empRes.json()
          setEmployees(data)
        }
      } catch {
        router.replace('/employee')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router])

  const toggleRole = async (employeeId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'employee' : 'admin'
    setUpdatingId(employeeId)
    try {
      const res = await fetch('/api/employees/role', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, role: newRole }),
      })
      if (res.ok) {
        setEmployees(prev =>
          prev.map(e => e.id === employeeId ? { ...e, role: newRole } : e)
        )
      }
    } catch {
      // Failed
    } finally {
      setUpdatingId(null)
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
              <Users className="w-4 h-4 text-blue-400" />
              <h1 className="text-sm font-semibold text-white">Manage Team</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-4 pb-8 max-w-lg mx-auto w-full mt-6">
        <p className="text-sm text-gray-400 mb-6">
          Tap an employee to toggle between regular employee and manager (admin). Managers can see profits, create events, approve bookings, and manage the team.
        </p>

        <div className="space-y-3">
          {employees.map(emp => (
            <button
              key={emp.id}
              onClick={() => toggleRole(emp.id, emp.role)}
              disabled={updatingId === emp.id}
              className="w-full flex items-center justify-between bg-gray-900 border border-gray-700/50 rounded-2xl p-4 hover:bg-gray-800 transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${
                  emp.role === 'admin' ? 'bg-amber-500/20' : 'bg-gray-700/50'
                }`}>
                  {emp.role === 'admin' ? (
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                  ) : (
                    <User className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-semibold text-white">{emp.name}</h3>
                  <p className="text-xs text-gray-500">
                    Joined {new Date(emp.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {updatingId === emp.id ? (
                  <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                ) : (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    emp.role === 'admin'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-gray-700/50 text-gray-400 border-gray-600/50'
                  }`}>
                    {emp.role === 'admin' ? (
                      <>
                        <Shield className="w-3 h-3" />
                        Manager
                      </>
                    ) : (
                      'Employee'
                    )}
                  </span>
                )}
              </div>
            </button>
          ))}

          {employees.length === 0 && (
            <div className="text-center py-10">
              <Users className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No employees yet</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
