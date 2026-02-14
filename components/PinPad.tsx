'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, Delete } from 'lucide-react'

interface PinPadProps {
  onSubmit: (pin: string) => void
  loading?: boolean
  error?: boolean
}

export default function PinPad({ onSubmit, loading = false, error = false }: PinPadProps) {
  const [digits, setDigits] = useState<string>('')
  const [shaking, setShaking] = useState(false)

  // Trigger shake animation when error prop changes to true
  useEffect(() => {
    if (error) {
      setShaking(true)
      setDigits('')
      const timer = setTimeout(() => setShaking(false), 500)
      return () => clearTimeout(timer)
    }
  }, [error])

  const handleDigit = useCallback((digit: string) => {
    if (loading) return
    if (digits.length >= 4) return

    const newDigits = digits + digit
    setDigits(newDigits)

    // Auto-submit when 4th digit is entered
    if (newDigits.length === 4) {
      onSubmit(newDigits)
    }
  }, [digits, loading, onSubmit])

  const handleBackspace = useCallback(() => {
    if (loading) return
    setDigits(prev => prev.slice(0, -1))
  }, [loading])

  const handleClear = useCallback(() => {
    if (loading) return
    setDigits('')
  }, [loading])

  const buttons = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    'clear', '0', 'backspace',
  ]

  const actionBtnClasses = 'h-[56px] rounded-xl bg-white/5 text-white/60 text-sm font-medium active:scale-95 transition-transform duration-100 touch-manipulation hover:bg-white/10'
  const backspaceBtnClasses = 'h-[56px] rounded-xl bg-white/5 text-white/60 flex items-center justify-center active:scale-95 transition-transform duration-100 touch-manipulation hover:bg-white/10'
  const digitBtnClasses = 'h-[56px] rounded-xl bg-white/10 text-white text-xl font-medium active:scale-95 transition-transform duration-100 touch-manipulation hover:bg-white/15'

  return (
    <div className="w-full max-w-[280px] mx-auto">
      {/* PIN dots */}
      <div className={shaking ? 'flex justify-center gap-4 mb-8 pinpad-shake' : 'flex justify-center gap-4 mb-8'}>
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={i < digits.length ? 'w-4 h-4 rounded-full transition-all duration-200 bg-amber-400 scale-110' : 'w-4 h-4 rounded-full transition-all duration-200 bg-white/20 border border-white/30'}
          />
        ))}
      </div>

      {/* Number grid */}
      <div className={loading ? 'grid grid-cols-3 gap-3 opacity-50 pointer-events-none' : 'grid grid-cols-3 gap-3'}>
        {buttons.map((btn) => {
          if (btn === 'clear') {
            return (
              <button
                key={btn}
                type="button"
                onClick={handleClear}
                disabled={loading}
                className={actionBtnClasses}
              >
                Clear
              </button>
            )
          }

          if (btn === 'backspace') {
            return (
              <button
                key={btn}
                type="button"
                onClick={handleBackspace}
                disabled={loading}
                className={backspaceBtnClasses}
              >
                <Delete className="w-5 h-5" />
              </button>
            )
          }

          return (
            <button
              key={btn}
              type="button"
              onClick={() => handleDigit(btn)}
              disabled={loading}
              className={digitBtnClasses}
            >
              {btn}
            </button>
          )
        })}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center mt-6">
          <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
        </div>
      )}
    </div>
  )
}
