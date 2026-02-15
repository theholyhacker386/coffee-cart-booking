'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Check } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const [employeeName, setEmployeeName] = useState('')
  const [notifyTwoPersonOnly, setNotifyTwoPersonOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Fetch current preferences on load
  useEffect(() => {
    async function fetchPreferences() {
      try {
        const res = await fetch('/api/employee/me')
        if (res.ok) {
          const data = await res.json()
          setEmployeeName(data.name || '')
          setNotifyTwoPersonOnly(data.notifyTwoPersonOnly || false)
        } else {
          // Not authenticated — redirect to login
          router.push('/employee')
        }
      } catch {
        // Network error
      } finally {
        setLoading(false)
      }
    }
    fetchPreferences()
  }, [router])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/employee/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifyTwoPersonOnly }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch {
      // Network error
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    )
  }

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
          <h1 className="text-sm font-semibold text-white">Settings</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 pb-8 max-w-lg mx-auto w-full mt-6 space-y-6">
        {/* Employee name (read-only) */}
        <div>
          <label className="block text-xs font-bold tracking-widest text-amber-400 uppercase mb-2">
            Your Name
          </label>
          <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/60 text-sm">
            {employeeName}
          </div>
        </div>

        {/* Notification preference */}
        <div>
          <label className="block text-xs font-bold tracking-widest text-amber-400 uppercase mb-3">
            Notification Preferences
          </label>
          <label className="flex items-start gap-3 px-4 py-4 bg-gray-900 border border-gray-700/50 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={notifyTwoPersonOnly}
              onChange={e => setNotifyTwoPersonOnly(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/10 text-amber-500 focus:ring-amber-500/50 accent-amber-500"
            />
            <div>
              <span className="text-sm text-white/80">Only notify me for 2-person events (75+ drinks)</span>
              <p className="text-xs text-white/40 mt-1">Check this if you prefer not to work solo events</p>
            </div>
          </label>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-200 bg-amber-500 text-gray-950 hover:bg-amber-400 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Check className="w-4 h-4" />
              Saved!
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </main>
    </div>
  )
}
