'use client'

import { useState, useEffect } from 'react'
import { X, Bell, BellRing } from 'lucide-react'

export default function NotificationPermissionPopup() {
  const [show, setShow] = useState(false)
  const [permissionState, setPermissionState] = useState<string>('default')

  useEffect(() => {
    // Only show if notifications are supported
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return

    // Check current permission
    const currentPermission = Notification.permission
    setPermissionState(currentPermission)

    // If already granted or denied, don't show
    if (currentPermission !== 'default') return

    // Check if already dismissed recently
    const dismissed = localStorage.getItem('cc_notif_dismissed')
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10)
      if (Date.now() - dismissedAt < 3 * 24 * 60 * 60 * 1000) return // 3 days
    }

    // Wait for the Add to Home Screen popup to potentially show/dismiss first
    const timer = setTimeout(() => {
      // Only show if the A2HS popup isn't currently visible
      const a2hsDismissed = localStorage.getItem('cc_a2hs_dismissed')
      if (a2hsDismissed || !(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))) {
        setShow(true)
      } else {
        // If on mobile and A2HS hasn't been dismissed yet, wait a bit longer
        const retryTimer = setTimeout(() => setShow(true), 5000)
        return () => clearTimeout(retryTimer)
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const requestPermission = async () => {
    try {
      // Register service worker first
      if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.register('/sw.js')
      }

      const permission = await Notification.requestPermission()
      setPermissionState(permission)

      if (permission === 'granted') {
        // Show a test notification
        new Notification('Notifications enabled!', {
          body: "You'll get reminders before your events.",
          icon: '/the porch coffe bar logo.png',
        })

        // Save that they enabled notifications
        localStorage.setItem('cc_notif_enabled', 'true')
      }

      setShow(false)
    } catch {
      setShow(false)
    }
  }

  const dismiss = () => {
    setShow(false)
    localStorage.setItem('cc_notif_dismissed', Date.now().toString())
  }

  if (!show || permissionState !== 'default') return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm px-4 pb-6">
      <div className="bg-gray-900 border border-gray-700/50 rounded-2xl w-full max-w-md p-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
            <BellRing className="w-6 h-6 text-amber-400" />
          </div>
          <button
            onClick={dismiss}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h2 className="text-lg font-semibold text-white mb-2">Turn on notifications?</h2>

        <p className="text-sm text-gray-300 mb-2">
          Get helpful reminders before your events:
        </p>

        <ul className="text-sm text-gray-400 space-y-1.5 mb-5 ml-1">
          <li className="flex items-center gap-2">
            <Bell className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            Day-before reminder to prep the cart
          </li>
          <li className="flex items-center gap-2">
            <Bell className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            1-hour heads up before you need to be at the shop
          </li>
        </ul>

        <div className="flex gap-3">
          <button
            onClick={dismiss}
            className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-colors"
          >
            Not now
          </button>
          <button
            onClick={requestPermission}
            className="flex-1 py-3 rounded-xl bg-amber-500 text-sm font-medium text-gray-950 hover:bg-amber-400 transition-colors"
          >
            Turn on
          </button>
        </div>
      </div>
    </div>
  )
}
