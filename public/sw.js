// Service Worker for The Porch Coffee Bar Employee Portal
// Enables push notifications

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})

// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}

  const title = data.title || 'The Porch Coffee Bar'
  const options = {
    body: data.body || 'You have a notification',
    icon: '/the porch coffe bar logo.png',
    badge: '/the porch coffe bar logo.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'porch-notification',
    data: {
      url: data.url || '/employee/dashboard'
    }
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// Handle notification click — open the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = event.notification.data?.url || '/employee/dashboard'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, focus it
      for (const client of windowClients) {
        if (client.url.includes('/employee') && 'focus' in client) {
          return client.focus()
        }
      }
      // Otherwise open a new window
      return clients.openWindow(url)
    })
  )
})
