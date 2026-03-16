import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, X, Building2, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  searchMosquesNearby,
  searchMosquesByKeyword,
  getSavedMosque,
  saveMosque,
  clearMosque,
} from '../lib/mosqueApi'

export default function MosqueSelector({ onMosqueChange }) {
  const { t } = useTranslation()
  const [saved, setSaved] = useState(getSavedMosque)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState(null)

  // Search by keyword
  useEffect(() => {
    if (!open || query.length < 2) {
      setResults([])
      return
    }

    const timeout = setTimeout(async () => {
      setSearching(true)
      setSearchError(null)
      try {
        const mosques = await searchMosquesByKeyword(query)
        setResults(mosques.slice(0, 10))
      } catch {
        setSearchError(t('mosque.search_error'))
      } finally {
        setSearching(false)
      }
    }, 400)

    return () => clearTimeout(timeout)
  }, [query, open, t])

  const handleNearby = async () => {
    if (!navigator.geolocation) return
    setSearching(true)
    setSearchError(null)

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const mosques = await searchMosquesNearby(pos.coords.latitude, pos.coords.longitude)
          setResults(mosques.slice(0, 10))
        } catch {
          setSearchError(t('mosque.search_error'))
        } finally {
          setSearching(false)
        }
      },
      () => {
        setSearchError(t('mosque.location_error'))
        setSearching(false)
      },
      { enableHighAccuracy: false, timeout: 10000 }
    )
  }

  const handleSelect = (mosque) => {
    saveMosque(mosque)
    setSaved(mosque)
    setOpen(false)
    setQuery('')
    setResults([])
    onMosqueChange?.()
  }

  const handleClear = () => {
    clearMosque()
    setSaved(null)
    onMosqueChange?.()
  }

  return (
    <>
      {/* Current mosque or select button */}
      <div className="flex items-center gap-3 px-5 py-4">
        <Building2 size={16} className="text-zinc-400 dark:text-zinc-500" strokeWidth={1.5} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {t('mosque.title')}
          </p>
          {saved ? (
            <p className="truncate text-xs text-emerald-600 dark:text-emerald-400">
              {saved.name}
            </p>
          ) : (
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              {t('mosque.calculated_times')}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {saved && (
            <button
              onClick={handleClear}
              className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
            >
              {t('mosque.remove')}
            </button>
          )}
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-600 transition hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
          >
            {saved ? t('mosque.change') : t('mosque.select')}
          </button>
        </div>
      </div>

      {/* Search overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-zinc-50 dark:bg-zinc-950"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800" style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 0.75rem)' }}>
              <button
                onClick={() => { setOpen(false); setQuery(''); setResults([]) }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800"
              >
                <X size={16} className="text-zinc-500" />
              </button>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {t('mosque.search_title')}
              </h2>
            </div>

            {/* Search input */}
            <div className="px-4 py-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('mosque.search_placeholder')}
                  className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-emerald-500"
                />
              </div>

              {/* Nearby button */}
              <button
                onClick={handleNearby}
                disabled={searching}
                className="mt-2 flex w-full items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <MapPin size={14} className="text-emerald-500" />
                {t('mosque.find_nearby')}
              </button>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto px-4 pb-8">
              {searching && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={20} className="animate-spin text-emerald-500" />
                </div>
              )}

              {searchError && (
                <p className="py-4 text-center text-sm text-red-500">{searchError}</p>
              )}

              {!searching && results.length > 0 && (
                <div className="space-y-2">
                  {results.map((mosque) => (
                    <button
                      key={mosque.uuid}
                      onClick={() => handleSelect(mosque)}
                      className="flex w-full items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 text-left transition hover:border-emerald-300 active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-emerald-700"
                    >
                      <Building2 size={18} className="mt-0.5 shrink-0 text-emerald-500" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {mosque.name}
                        </p>
                        {mosque.address && (
                          <p className="mt-0.5 truncate text-xs text-zinc-400">
                            {mosque.address}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!searching && !searchError && results.length === 0 && query.length >= 2 && (
                <p className="py-4 text-center text-sm text-zinc-400">
                  {t('mosque.no_results')}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
