'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Shield, Plus, ArrowLeft, Loader2 } from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function checkRole() {
      try {
        const res = await fetch('/api/employee/me')
        if (res.ok) {
          const data = await res.json()
          if (data.role === 'admin') {
            setIsAdmin(true)
          } else {
            router.replace('/employee/dashboard')
            return
          }
        } else {
          router.replace('/employee')
          return
        }
      } catch {
        router.replace('/employee')
        return
      }
      setLoading(false)
    }
    checkRole()
  }, [router])

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
            onClick={() => router.push('/employee/dashboard')}
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
              <Shield className="w-4 h-4 text-amber-400" />
              <h1 className="text-sm font-semibold text-white">Admin Panel</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-4 pb-8 max-w-lg mx-auto w-full mt-6">
        {/* Admin badge */}
        <div className="flex items-center gap-2 mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Shield className="w-3 h-3" />
            Admin Access
          </span>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => router.push('/employee/admin/create-event')}
            className="w-full flex items-center gap-4 bg-gray-900 border border-gray-700/50 rounded-2xl p-5 hover:border-amber-500/30 hover:bg-gray-800 transition-all duration-200 active:scale-[0.98]"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/20">
              <Plus className="w-6 h-6 text-amber-400" />
            </div>
            <div className="text-left">
              <h3 className="text-base font-semibold text-white">Create Event</h3>
              <p className="text-sm text-gray-400">Manually add a new booking</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/employee/dashboard')}
            className="w-full flex items-center gap-4 bg-gray-900 border border-gray-700/50 rounded-2xl p-5 hover:border-gray-600 hover:bg-gray-800 transition-all duration-200 active:scale-[0.98]"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-700/50">
              <ArrowLeft className="w-6 h-6 text-gray-300" />
            </div>
            <div className="text-left">
              <h3 className="text-base font-semibold text-white">Back to Dashboard</h3>
              <p className="text-sm text-gray-400">View all events</p>
            </div>
          </button>
        </div>
      </main>
    </div>
  )
}
