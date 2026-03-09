import { useState, useEffect } from 'react'

const AYAH_KEY = 'daily-ayah'
const API_URL = 'https://api.alquran.cloud/v1/ayah/random/en.asad'

/** Get today's date as YYYY-MM-DD */
function getToday() {
  return new Date().toISOString().split('T')[0]
}

/** Load cached ayah from localStorage if it's from today */
function loadCachedAyah() {
  try {
    const cached = JSON.parse(localStorage.getItem(AYAH_KEY))
    if (cached && cached.date === getToday()) return cached.ayah
  } catch { /* ignore corrupted cache */ }
  return null
}

/** Save ayah + today's date to localStorage */
function cacheAyah(ayah) {
  localStorage.setItem(AYAH_KEY, JSON.stringify({ date: getToday(), ayah }))
}

/**
 * DailyAyah - Displays one random Quran verse per day.
 * Fetches from the Al Quran Cloud API and caches in localStorage.
 * Shows a fade-in animation when the ayah loads.
 */
export default function DailyAyah() {
  const [ayah, setAyah] = useState(loadCachedAyah)
  const [loading, setLoading] = useState(() => loadCachedAyah() === null)
  const [error, setError] = useState(null)
  const [visible, setVisible] = useState(() => loadCachedAyah() !== null)

  useEffect(() => {
    // If we already have today's cached ayah, no need to fetch
    if (ayah) return

    let cancelled = false

    async function fetchAyah() {
      try {
        const res = await fetch(API_URL)
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        const json = await res.json()

        const data = json.data
        const result = {
          text: data.text,
          surahName: data.surah.englishName,
          surahNumber: data.surah.number,
          ayahNumber: data.numberInSurah,
        }

        if (!cancelled) {
          cacheAyah(result)
          setAyah(result)
          // Trigger fade-in after a brief delay so the DOM updates first
          setTimeout(() => setVisible(true), 50)
        }
      } catch {
        if (!cancelled) setError('Could not load daily ayah.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchAyah()
    return () => { cancelled = true }
  }, [ayah])

  // Loading state — subtle skeleton
  if (loading) {
    return (
      <div className="mb-6 w-full rounded-xl bg-white px-6 py-5 shadow-sm dark:bg-gray-800">
        <div className="flex flex-col items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-green-400">
            Daily Ayah
          </span>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
        </div>
      </div>
    )
  }

  // Error state — short message, app still works
  if (error || !ayah) {
    return (
      <div className="mb-6 w-full rounded-xl bg-white px-6 py-5 shadow-sm dark:bg-gray-800">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-green-400">
            Daily Ayah
          </span>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {error ?? 'Unavailable'}
          </p>
        </div>
      </div>
    )
  }

  // Ayah display with fade-in
  return (
    <div
      className={`mb-6 w-full rounded-xl bg-white px-6 py-5 shadow-sm transition-all duration-700 ease-out dark:bg-gray-800
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
    >
      <div className="flex flex-col items-center gap-3 text-center">
        {/* Section label */}
        <span className="text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-green-400">
          Daily Ayah
        </span>

        {/* Ayah text */}
        <p className="text-base leading-relaxed text-gray-700 italic dark:text-gray-300">
          &ldquo;{ayah.text}&rdquo;
        </p>

        {/* Surah reference */}
        <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
          Surah {ayah.surahName} ({ayah.surahNumber}:{ayah.ayahNumber})
        </span>
      </div>
    </div>
  )
}
