'use client'

import { useState, useEffect } from 'react'
import { X, Share, PlusSquare, MoreVertical, Download } from 'lucide-react'

export default function AddToHomeScreenPopup() {
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)

  useEffect(() => {
    // Only show on mobile devices
    const ua = navigator.userAgent
    const mobile = /iPhone|iPad|iPod|Android/i.test(ua)
    if (!mobile) return

    // Check if already installed as PWA (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || ('standalone' in navigator && (navigator as Record<string, unknown>).standalone === true)
    if (isStandalone) return

    // Check if already dismissed
    const dismissed = localStorage.getItem('cc_a2hs_dismissed')
    if (dismissed) {
      // Show again after 7 days
      const dismissedAt = parseInt(dismissed, 10)
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return
    }

    setIsIOS(/iPhone|iPad|iPod/i.test(ua))
    setIsAndroid(/Android/i.test(ua))

    // Small delay so it doesn't pop up immediately
    const timer = setTimeout(() => setShow(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  const dismiss = () => {
    setShow(false)
    localStorage.setItem('cc_a2hs_dismissed', Date.now().toString())
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm px-4 pb-6">
      <div className="bg-gray-900 border border-gray-700/50 rounded-2xl w-full max-w-md p-5 shadow-2xl animate-in slide-in-from-bottom">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Add to Home Screen</h2>
          <button
            onClick={dismiss}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-300 mb-5">
          Install this app on your phone for quick access and to enable notifications.
        </p>

        {/* iOS Instructions */}
        {isIOS && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-amber-400 font-bold text-sm">1</span>
              </div>
              <div>
                <p className="text-sm text-white font-medium">Tap the Share button</p>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  Look for the <Share className="w-3.5 h-3.5 inline" /> icon at the bottom of Safari
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-amber-400 font-bold text-sm">2</span>
              </div>
              <div>
                <p className="text-sm text-white font-medium">Scroll down and tap &ldquo;Add to Home Screen&rdquo;</p>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  Look for the <PlusSquare className="w-3.5 h-3.5 inline" /> icon
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-amber-400 font-bold text-sm">3</span>
              </div>
              <div>
                <p className="text-sm text-white font-medium">Tap &ldquo;Add&rdquo;</p>
                <p className="text-xs text-gray-400 mt-0.5">The app will appear on your home screen like a regular app</p>
              </div>
            </div>
          </div>
        )}

        {/* Android Instructions */}
        {isAndroid && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-amber-400 font-bold text-sm">1</span>
              </div>
              <div>
                <p className="text-sm text-white font-medium">Tap the menu button</p>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  Look for <MoreVertical className="w-3.5 h-3.5 inline" /> (three dots) in Chrome
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-amber-400 font-bold text-sm">2</span>
              </div>
              <div>
                <p className="text-sm text-white font-medium">Tap &ldquo;Install app&rdquo; or &ldquo;Add to Home screen&rdquo;</p>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  Look for the <Download className="w-3.5 h-3.5 inline" /> icon
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-amber-400 font-bold text-sm">3</span>
              </div>
              <div>
                <p className="text-sm text-white font-medium">Tap &ldquo;Install&rdquo;</p>
                <p className="text-xs text-gray-400 mt-0.5">The app will appear on your home screen</p>
              </div>
            </div>
          </div>
        )}

        {/* Dismiss button */}
        <button
          onClick={dismiss}
          className="w-full mt-6 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}
