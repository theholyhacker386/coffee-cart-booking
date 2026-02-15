'use client'

import { useState, useEffect } from 'react'
import { X, Bell, BellRing } from 'lucide-react'

/** Convert a VAPID public key from base64 URL string to Uint8Array for the Push API */
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

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

    // Poll until the Add to Home Screen popup is gone, then show
    const checkAndShow = () => {
      const a2hsPopup = document.querySelector('[data-a2hs-popup]')
      if (a2hsPopup) {
        // A2HS popup is still showing, check again in 1 second
        setTimeout(checkAndShow, 1000)
      } else {
        setShow(true)
      }
    }

    // Wait 3 seconds then start checking
    const timer = setTimeout(checkAndShow, 3000)
    return () => clearTimeout(timer)
  }, [])

  const requestPermission = async () => {
    try {
      // Register service worker first
      let registration: ServiceWorkerRegistration | undefined
      if ('serviceWorker' in navigator) {
        registration = await navigator.serviceWorker.register('/sw.js')
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

        // Subscribe to push notifications and save to database
        if (registration && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
          try {
            const pushSubscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
            })

            // Send the subscription to our API to save in the database
            await fetch('/api/push/subscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ subscription: pushSubscription.toJSON() }),
            })
          } catch (pushErr) {
            console.error('Push subscription error:', pushErr)
          }
        }
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
