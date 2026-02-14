'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import PinPad from '@/components/PinPad'

type Mode = 'signin' | 'signup'

export default function EmployeeLoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('signin')
  const [name, setName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [pinError, setPinError] = useState(false)

  const handleSubmit = useCallback(async (pin: string) => {
    setError('')
    setPinError(false)

    // Basic validation before calling the API
    if (!name.trim()) {
      setError('Please enter your name')
      setPinError(true)
      return
    }

    if (mode === 'signup' && !inviteCode.trim()) {
      setError('Please enter the invite code')
      setPinError(true)
      return
    }

    setLoading(true)

    try {
      const endpoint = mode === 'signin'
        ? '/api/employee/login'
        : '/api/employee/signup'

      const body = mode === 'signin'
        ? { name: name.trim(), pin }
        : { name: name.trim(), pin, inviteCode: inviteCode.trim() }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        setPinError(true)
        setLoading(false)
        return
      }

      // Success — go to the employee dashboard
      router.push('/employee/dashboard')
    } catch {
      setError('Unable to connect. Please try again.')
      setPinError(true)
      setLoading(false)
    }
  }, [name, inviteCode, mode, router])

  const switchMode = (newMode: Mode) => {
    setMode(newMode)
    setError('')
    setPinError(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center px-4 py-8 sm:py-12">
      {/* Logo */}
      <div className="mb-6">
        <Image
          src="/the porch coffe bar logo.png"
          alt="The Porch Coffee Bar"
          width={100}
          height={100}
          className="mx-auto rounded-full"
          priority
        />
      </div>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-serif text-white mb-8">
        Employee Portal
      </h1>

      {/* Mode toggle tabs */}
      <div className="flex bg-white/5 rounded-xl p-1 mb-8 w-full max-w-[320px]">
        <button
          type="button"
          onClick={() => switchMode('signin')}
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
            mode === 'signin'
              ? 'bg-amber-500 text-gray-950'
              : 'text-white/60 hover:text-white/80'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => switchMode('signup')}
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
            mode === 'signup'
              ? 'bg-amber-500 text-gray-950'
              : 'text-white/60 hover:text-white/80'
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Form area */}
      <div className="w-full max-w-[320px] space-y-4">
        {/* Name input */}
        <div>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
            className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors"
            autoComplete="name"
          />
        </div>

        {/* Invite code input (signup only) */}
        {mode === 'signup' && (
          <div>
            <input
              type="text"
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value)}
              placeholder="Invite code"
              className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors"
              autoComplete="off"
            />
          </div>
        )}

        {/* PIN label */}
        <p className="text-white/50 text-sm text-center pt-2">
          {mode === 'signin' ? 'Enter your 4-digit PIN' : 'Choose a 4-digit PIN'}
        </p>

        {/* PIN Pad */}
        <PinPad
          onSubmit={handleSubmit}
          loading={loading}
          error={pinError}
        />

        {/* Error message */}
        {error && (
          <div className="text-center">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
