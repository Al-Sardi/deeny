import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermission,
  schedulePrayerNotifications,
  cancelPrayerNotifications,
  getNotificationSupport,
} from '../lib/notifications'

export default function useNotifications(prayerTimes) {
  const { i18n } = useTranslation()
  const [settings, setSettings] = useState(getNotificationSettings)

  // Schedule notifications when prayer times, settings, or language change
  useEffect(() => {
    if (!settings.enabled || !prayerTimes) {
      cancelPrayerNotifications()
      return
    }
    schedulePrayerNotifications(prayerTimes, settings.minutesBefore, i18n.language)
    return () => cancelPrayerNotifications()
  }, [prayerTimes, settings.enabled, settings.minutesBefore, i18n.language])

  // Re-schedule when app comes back to foreground
  useEffect(() => {
    if (!settings.enabled || !prayerTimes) return

    function handleVisibility() {
      if (document.visibilityState === 'visible') {
        schedulePrayerNotifications(prayerTimes, settings.minutesBefore, i18n.language)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [settings.enabled, settings.minutesBefore, prayerTimes, i18n.language])

  const updateSettings = async (newSettings) => {
    if (newSettings.enabled && !settings.enabled) {
      const perm = await requestNotificationPermission()
      if (perm !== 'granted') return false
    }
    saveNotificationSettings(newSettings)
    setSettings(newSettings)
    return true
  }

  return {
    notificationSettings: settings,
    updateNotificationSettings: updateSettings,
    notificationsSupported: getNotificationSupport(),
  }
}
