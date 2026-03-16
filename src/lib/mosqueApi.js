/**
 * Mosque search via Mawaqit unofficial API.
 * Falls back gracefully if the API is unavailable.
 */

const MAWAQIT_BASE = 'https://mawaqit.net/api/2.0'

/**
 * Search mosques near given coordinates.
 * Returns up to 10 mosques with name, address, and UUID.
 */
export async function searchMosquesNearby(latitude, longitude) {
  const url = `${MAWAQIT_BASE}/mosquee/search?word=&lat=${latitude}&lon=${longitude}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Mawaqit API error: ${res.status}`)
  const data = await res.json()

  return data.map((m) => ({
    uuid: m.uuid,
    name: m.name,
    address: m.localisation || '',
    latitude: m.latitude,
    longitude: m.longitude,
  }))
}

/**
 * Search mosques by keyword (name or city).
 */
export async function searchMosquesByKeyword(keyword) {
  const url = `${MAWAQIT_BASE}/mosquee/search?word=${encodeURIComponent(keyword)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Mawaqit API error: ${res.status}`)
  const data = await res.json()

  return data.map((m) => ({
    uuid: m.uuid,
    name: m.name,
    address: m.localisation || '',
    latitude: m.latitude,
    longitude: m.longitude,
  }))
}

/**
 * Fetch prayer times for a specific mosque by its slug/uuid.
 * Returns today's 5 prayer times in "HH:MM" format.
 */
export async function fetchMosquePrayerTimes(uuid) {
  const url = `${MAWAQIT_BASE}/mosquee/${uuid}/prayer-times`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Mawaqit API error: ${res.status}`)
  const data = await res.json()

  // Mawaqit returns an array of 5 times [Fajr, Dhuhr, Asr, Maghrib, Isha]
  const names = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
  const times = data.times || data.calendar || data

  if (Array.isArray(times) && times.length >= 5) {
    const result = {}
    names.forEach((name, i) => {
      result[name] = times[i]
    })
    return result
  }

  throw new Error('Unexpected prayer times format from Mawaqit')
}

const MOSQUE_KEY = 'deeny-selected-mosque'

export function getSavedMosque() {
  try {
    return JSON.parse(localStorage.getItem(MOSQUE_KEY))
  } catch {
    return null
  }
}

export function saveMosque(mosque) {
  localStorage.setItem(MOSQUE_KEY, JSON.stringify(mosque))
}

export function clearMosque() {
  localStorage.removeItem(MOSQUE_KEY)
  localStorage.removeItem('prayer-times-cache')
}
