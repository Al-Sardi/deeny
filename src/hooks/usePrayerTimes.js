import { useState, useEffect, useCallback } from 'react'

const CACHE_KEY = 'prayer-times-cache'
const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']

function getToday() {
  return new Date().toISOString().split('T')[0]
}

/** Parse "HH:MM" into total minutes since midnight */
function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

/** Format "HH:MM" keeping 24h format (strip leading zero) */
function formatTime(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  return `${h}:${String(m).padStart(2, '0')}`
}

/** Find the next prayer that hasn't passed yet, or null if all have */
function computeNextPrayer(prayerTimes) {
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  for (const name of PRAYER_NAMES) {
    if (timeToMinutes(prayerTimes[name]) > nowMinutes) {
      return { name, time: prayerTimes[name] }
    }
  }
  return null
}

function loadCachedTimes() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY))
    if (cached && cached.date === getToday()) return cached.timings
  } catch { /* ignore corrupted cache */ }
  return null
}

function cacheTimes(timings) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ date: getToday(), timings }))
}

/**
 * usePrayerTimes - Fetches prayer times via browser geolocation + Aladhan API.
 * Caches results in localStorage for the current day.
 * Re-computes the next prayer every 60 seconds.
 */
export default function usePrayerTimes() {
  const [prayerTimes, setPrayerTimes] = useState(loadCachedTimes)
  const [loading, setLoading] = useState(() => loadCachedTimes() === null)
  const [error, setError] = useState(null)
  const [nextPrayer, setNextPrayer] = useState(null)
  const [nextPrayerTime, setNextPrayerTime] = useState(null)

  const updateNextPrayer = useCallback(() => {
    if (!prayerTimes) return
    const next = computeNextPrayer(prayerTimes)
    setNextPrayer(next ? next.name : null)
    setNextPrayerTime(next ? formatTime(next.time) : null)
  }, [prayerTimes])

  // Fetch prayer times (cache-first, then geolocation + API)
  useEffect(() => {
    if (loadCachedTimes()) {
      setLoading(false)
      return
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        const timestamp = Math.floor(Date.now() / 1000)
        const url = `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${latitude}&longitude=${longitude}&method=4`

        try {
          const res = await fetch(url)
          if (!res.ok) throw new Error(`API error: ${res.status}`)
          const json = await res.json()

          // Extract only the 5 prayers we track
          const filtered = {}
          for (const name of PRAYER_NAMES) {
            filtered[name] = json.data.timings[name]
          }

          cacheTimes(filtered)
          setPrayerTimes(filtered)
        } catch {
          setError('Could not fetch prayer times. Please try again later.')
        } finally {
          setLoading(false)
        }
      },
      (geoError) => {
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setError('Location access denied. Enable location to see prayer times.')
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          setError('Location unavailable. Please try again.')
        } else {
          setError('Location request timed out. Please try again.')
        }
        setLoading(false)
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    )
  }, [])

  // Re-compute next prayer on mount and every 60 seconds
  useEffect(() => {
    updateNextPrayer()
    const interval = setInterval(updateNextPrayer, 60_000)
    return () => clearInterval(interval)
  }, [updateNextPrayer])

  return { prayerTimes, nextPrayer, nextPrayerTime, loading, error }
}
