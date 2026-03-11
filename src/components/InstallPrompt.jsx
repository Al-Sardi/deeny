import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X } from 'lucide-react'

const DISMISSED_KEY = 'pwa-install-dismissed'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Don't show if user already dismissed recently (7 days)
    const dismissed = localStorage.getItem(DISMISSED_KEY)
    if (dismissed && Date.now() - Number(dismissed) < 7 * 24 * 60 * 60 * 1000) {
      return
    }

    function handleBeforeInstall(e) {
      e.preventDefault()
      setDeferredPrompt(e)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    // Hide banner if app was installed
    window.addEventListener('appinstalled', () => {
      setVisible(false)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setVisible(false)
    }
    setDeferredPrompt(null)
  }

  function handleDismiss() {
    setVisible(false)
    localStorage.setItem(DISMISSED_KEY, String(Date.now()))
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md"
        >
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-600 px-4 py-3 text-white shadow-lg shadow-emerald-600/25">
            <Download className="h-5 w-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Deeny installieren</p>
              <p className="text-xs text-emerald-100">
                Füge Deeny zu deinem Homescreen hinzu
              </p>
            </div>
            <button
              onClick={handleInstall}
              className="shrink-0 rounded-xl bg-white px-3.5 py-1.5 text-sm font-semibold text-emerald-700 transition-colors active:bg-emerald-50"
            >
              Installieren
            </button>
            <button
              onClick={handleDismiss}
              className="shrink-0 rounded-full p-1 transition-colors hover:bg-emerald-500 active:bg-emerald-500"
              aria-label="Schließen"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
