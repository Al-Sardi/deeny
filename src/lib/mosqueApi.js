/**
 * Mosque search via Mawaqit unofficial API.
 * Falls back gracefully if the API is unavailable.
 */

const MAWAQIT_BASE = 'https://mawaqit.net/api/2.0'

/**
 * Parse a Mawaqit mosque object into our internal format.
 * The search endpoint already returns times + iqama inline.
 */
function parseMosque(m) {
  return {
    uuid: m.uuid,
    slug: m.slug,
    name: m.name,
    address: m.localisation || '',
    latitude: m.latitude,
    longitude: m.longitude,
    // times is an array of 6 strings: [Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha]
    times: m.times,
    iqama: m.iqama,
    iqamaEnabled: m.iqamaEnabled,
  }
}

/**
 * Search mosques near given coordinates.
 * Returns up to 10 mosques with name, address, UUID, and prayer times.
 */
export async function searchMosquesNearby(latitude, longitude) {
  const url = `${MAWAQIT_BASE}/mosque/search?word=&lat=${latitude}&lon=${longitude}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Mawaqit API error: ${res.status}`)
  const data = await res.json()
  return data.map(parseMosque)
}

/**
 * Search mosques by keyword (name or city).
 */
export async function searchMosquesByKeyword(keyword) {
  const url = `${MAWAQIT_BASE}/mosque/search?word=${encodeURIComponent(keyword)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Mawaqit API error: ${res.status}`)
  const data = await res.json()
  return data.map(parseMosque)
}

/**
 * Extract the 5 prayer times from a saved mosque object.
 * Mawaqit returns 6 times: [Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha].
 * We skip Sunrise (index 1) and return the 5 obligatory prayers.
 */
export function extractPrayerTimes(mosque) {
  const t = mosque.times
  if (!Array.isArray(t) || t.length < 6) {
    throw new Error('Unexpected prayer times format from Mawaqit')
  }
  return {
    Fajr: t[0],
    Dhuhr: t[2],
    Asr: t[3],
    Maghrib: t[4],
    Isha: t[5],
  }
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
