// Custom notification click handler – imported by the generated service worker
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes('/app') && 'focus' in client) return client.focus()
      }
      return self.clients.openWindow('/app')
    })
  )
})
