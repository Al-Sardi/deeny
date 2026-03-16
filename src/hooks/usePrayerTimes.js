import { useState, useEffect, useCallback } from 'react'
import { getToday } from '../lib/dateUtils'
import { getSavedMosque, extractPrayerTimes } from '../lib/mosqueApi'

const CACHE_KEY = 'prayer-times-cache'
const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']

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

function cacheTimes(timings, source = 'aladhan') {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ date: getToday(), timings, source }))
}

function getCachedSource() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY))
    if (cached && cached.date === getToday()) return cached.source || 'aladhan'
  } catch { /* ignore */ }
  return 'aladhan'
}

/** Fetch prayer times from AlAdhan API using GPS coordinates */
async function fetchAladhanTimes(latitude, longitude) {
  const timestamp = Math.floor(Date.now() / 1000)
  const url = `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${latitude}&longitude=${longitude}&method=4`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const json = await res.json()

  const filtered = {}
  for (const name of PRAYER_NAMES) {
    filtered[name] = json.data.timings[name]
  }
  return filtered
}

/**
 * usePrayerTimes - Hybrid prayer times hook.
 * If a mosque is selected → fetches from Mawaqit.
 * Otherwise → uses geolocation + AlAdhan API.
 * Caches results in localStorage for the current day.
 * Re-computes the next prayer every 60 seconds.
 */
export default function usePrayerTimes() {
  const [prayerTimes, setPrayerTimes] = useState(loadCachedTimes)
  const [loading, setLoading] = useState(() => loadCachedTimes() === null)
  const [error, setError] = useState(null)
  const [nextPrayer, setNextPrayer] = useState(null)
  const [nextPrayerTime, setNextPrayerTime] = useState(null)
  const [source, setSource] = useState(getCachedSource)

  const updateNextPrayer = useCallback(() => {
    if (!prayerTimes) return
    const next = computeNextPrayer(prayerTimes)
    setNextPrayer(next ? next.name : null)
    setNextPrayerTime(next ? formatTime(next.time) : null)
  }, [prayerTimes])

  // Fetch prayer times (cache-first, then mosque or geolocation)
  useEffect(() => {
    if (loadCachedTimes()) {
      setLoading(false)
      return
    }

    const mosque = getSavedMosque()

    if (mosque) {
      // Mosque mode: extract times from saved mosque data
      try {
        const times = extractPrayerTimes(mosque)
        cacheTimes(times, 'mosque')
        setPrayerTimes(times)
        setSource('mosque')
        setLoading(false)
      } catch {
        setError('Could not read mosque prayer times. Falling back to calculated times.')
        fetchWithGeolocation()
      }
    } else {
      // Default: AlAdhan with geolocation
      fetchWithGeolocation()
    }

    function fetchWithGeolocation() {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser.')
        setLoading(false)
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          try {
            const times = await fetchAladhanTimes(latitude, longitude)
            cacheTimes(times, 'aladhan')
            setPrayerTimes(times)
            setSource('aladhan')
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
    }
  }, [])

  // Re-compute next prayer on mount and every 60 seconds
  useEffect(() => {
    updateNextPrayer()
    const interval = setInterval(updateNextPrayer, 60_000)
    return () => clearInterval(interval)
  }, [updateNextPrayer])

  return { prayerTimes, nextPrayer, nextPrayerTime, loading, error, source }
}
