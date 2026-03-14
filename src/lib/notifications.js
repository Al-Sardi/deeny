const SETTINGS_KEY = 'deeny-notification-settings'

const PRAYER_MESSAGES = {
  Fajr: {
    en: 'Rise for Fajr. The early morning prayer is witnessed by angels.',
    de: 'Steh auf zum Fajr. Das Morgengebet wird von Engeln bezeugt.',
    es: 'Levántate para Fajr. La oración del amanecer es presenciada por los ángeles.',
  },
  Dhuhr: {
    en: 'Dhuhr is approaching. Take a moment to connect with Allah.',
    de: 'Dhuhr naht. Nimm dir einen Moment, um dich mit Allah zu verbinden.',
    es: 'Dhuhr se acerca. Tómate un momento para conectar con Allah.',
  },
  Asr: {
    en: "Asr is near. Don't let the afternoon pass without prayer.",
    de: 'Asr ist nah. Lass den Nachmittag nicht ohne Gebet vergehen.',
    es: 'Asr está cerca. No dejes pasar la tarde sin oración.',
  },
  Maghrib: {
    en: 'Maghrib is approaching. Pause and give thanks.',
    de: 'Maghrib naht. Halte inne und sei dankbar.',
    es: 'Maghrib se acerca. Pausa y da gracias.',
  },
  Isha: {
    en: 'Isha is near. End your day with prayer.',
    de: 'Isha ist nah. Beende deinen Tag mit Gebet.',
    es: 'Isha está cerca. Termina tu día con oración.',
  },
}

const PRAYER_TITLES = {
  en: (name) => `${name} Prayer`,
  de: (name) => `${name}-Gebet`,
  es: (name) => `Oración de ${name}`,
}

const FRIDAY_REFLECTION_MESSAGES = {
  en: 'Take a moment to reflect. What did you learn this week from the Quran?',
  de: 'Nimm dir einen Moment zum Nachdenken. Was hast du diese Woche aus dem Quran gelernt?',
  es: 'Toma un momento para reflexionar. ¿Qué aprendiste esta semana del Corán?',
}

const FRIDAY_TITLES = {
  en: 'Friday Reflection',
  de: 'Freitagsreflexion',
  es: 'Reflexión del viernes',
}

let scheduledTimeouts = []

export function getNotificationSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { enabled: false, minutesBefore: 10 }
}

export function saveNotificationSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  return await Notification.requestPermission()
}

export function getNotificationSupport() {
  return 'Notification' in window && 'serviceWorker' in navigator
}

/**
 * Parse "HH:MM" time string to a Date object for today.
 * If the time has already passed, returns null.
 */
function prayerTimeToDate(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d
}

/**
 * Schedule notifications for all upcoming prayers.
 * Clears any previously scheduled timeouts first.
 */
export function schedulePrayerNotifications(prayerTimes, minutesBefore, lang = 'en') {
  cancelPrayerNotifications()

  if (!prayerTimes || Notification.permission !== 'granted') return

  const now = Date.now()

  for (const [name, timeStr] of Object.entries(prayerTimes)) {
    const prayerDate = prayerTimeToDate(timeStr)
    if (!prayerDate) continue

    const notifyAt = prayerDate.getTime() - minutesBefore * 60 * 1000
    const delay = notifyAt - now

    if (delay > 0) {
      const id = setTimeout(() => {
        showPrayerNotification(name, lang)
      }, delay)
      scheduledTimeouts.push(id)
    }
  }

  // Friday reflection reminder — schedule at 13:00 (after Jumu'ah)
  const today = new Date()
  if (today.getDay() === 5) {
    const fridayReminder = new Date()
    fridayReminder.setHours(13, 0, 0, 0)
    const fridayDelay = fridayReminder.getTime() - now
    const shownKey = `friday-reflection-${today.toISOString().slice(0, 10)}`

    if (fridayDelay > 0 && !localStorage.getItem(shownKey)) {
      const id = setTimeout(() => {
        localStorage.setItem(shownKey, '1')
        showFridayReflectionNotification(lang)
      }, fridayDelay)
      scheduledTimeouts.push(id)
    }
  }
}

export function cancelPrayerNotifications() {
  for (const id of scheduledTimeouts) {
    clearTimeout(id)
  }
  scheduledTimeouts = []
}

async function showFridayReflectionNotification(lang) {
  try {
    const reg = await navigator.serviceWorker?.ready
    if (!reg) return

    const effectiveLang = FRIDAY_REFLECTION_MESSAGES[lang] ? lang : 'en'

    await reg.showNotification(FRIDAY_TITLES[effectiveLang] || FRIDAY_TITLES.en, {
      body: FRIDAY_REFLECTION_MESSAGES[effectiveLang],
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: 'friday-reflection',
      renotify: true,
      vibrate: [200, 100, 200],
    })
  } catch (err) {
    console.error('Failed to show Friday reflection notification:', err)
  }
}

async function showPrayerNotification(prayerName, lang) {
  try {
    const reg = await navigator.serviceWorker?.ready
    if (!reg) return

    const effectiveLang = PRAYER_MESSAGES[prayerName]?.[lang] ? lang : 'en'
    const title = (PRAYER_TITLES[effectiveLang] || PRAYER_TITLES.en)(prayerName)
    const body = PRAYER_MESSAGES[prayerName]?.[effectiveLang] || PRAYER_MESSAGES[prayerName]?.en

    await reg.showNotification(title, {
      body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: `prayer-${prayerName}`,
      renotify: true,
      vibrate: [200, 100, 200],
      data: { prayer: prayerName },
    })
  } catch (err) {
    console.error('Failed to show notification:', err)
  }
}
