import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, LogOut, ChevronRight, Globe, Bell, BellOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'

const LANGUAGES = [
  { code: 'en', label: 'English \u{1F1EC}\u{1F1E7}' },
  { code: 'de', label: 'Deutsch \u{1F1E9}\u{1F1EA}' },
  { code: 'es', label: 'Espa\u00f1ol \u{1F1EA}\u{1F1F8}' },
  { code: 'fr', label: 'Fran\u00e7ais \u{1F1EB}\u{1F1F7}' },
  { code: 'ar', label: '\u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u{1F1F8}\u{1F1E6}' },
]

const MINUTES_OPTIONS = [5, 10, 15, 30]

export default function SettingsTab({ dark, onToggleTheme, notificationSettings, onUpdateNotificationSettings, notificationsSupported }) {
  const { t, i18n } = useTranslation()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    await signOut()
    navigate('/login')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* Account */}
      <section>
        <h2 className="mb-2 px-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">{t('settings.account')}</h2>
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {/* Email row */}
          <div className="flex items-center gap-3 border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
            <Mail size={16} className="text-zinc-400 dark:text-zinc-500" strokeWidth={1.5} />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('settings.email')}</p>
              <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {user?.email ?? t('settings.not_signed_in')}
              </p>
            </div>
          </div>

          {/* Logout row */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 px-5 py-4 transition-colors hover:bg-zinc-50 active:bg-zinc-100 disabled:opacity-50 dark:hover:bg-zinc-800/50 dark:active:bg-zinc-800"
          >
            <LogOut size={16} className="text-red-500" strokeWidth={1.5} />
            <span className="flex-1 text-left text-sm font-medium text-red-600 dark:text-red-400">
              {loggingOut ? t('settings.signing_out') : t('settings.sign_out')}
            </span>
            <ChevronRight size={14} className="text-zinc-300 dark:text-zinc-700" />
          </button>
        </div>
      </section>

      {/* Notifications */}
      {notificationsSupported && (
        <section>
          <h2 className="mb-2 px-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">{t('settings.notifications')}</h2>
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            {/* Enable toggle */}
            <div className={`flex items-center gap-3 px-5 py-4 ${notificationSettings?.enabled ? 'border-b border-zinc-100 dark:border-zinc-800' : ''}`}>
              {notificationSettings?.enabled
                ? <Bell size={16} className="text-emerald-500" strokeWidth={1.5} />
                : <BellOff size={16} className="text-zinc-400 dark:text-zinc-500" strokeWidth={1.5} />
              }
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t('settings.notifications_enabled')}</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">{t('settings.notifications_desc')}</p>
              </div>
              <button
                onClick={async () => {
                  const ok = await onUpdateNotificationSettings({
                    ...notificationSettings,
                    enabled: !notificationSettings?.enabled,
                  })
                  if (!ok && !notificationSettings?.enabled) {
                    // Permission denied — can't enable
                  }
                }}
                role="switch"
                aria-checked={notificationSettings?.enabled || false}
                className={`relative inline-flex h-[26px] w-[44px] shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200
                  ${notificationSettings?.enabled ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}
              >
                <motion.span
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={`inline-block h-[20px] w-[20px] rounded-full bg-white shadow-sm
                    ${notificationSettings?.enabled ? 'ml-[21px]' : 'ml-[3px]'}`}
                />
              </button>
            </div>

            {/* Minutes before selector */}
            {notificationSettings?.enabled && (
              <div className="flex items-center gap-3 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t('settings.minutes_before')}</p>
                </div>
                <div className="flex gap-1 rounded-xl bg-zinc-100 p-0.5 dark:bg-zinc-800">
                  {MINUTES_OPTIONS.map((min) => (
                    <button
                      key={min}
                      onClick={() => onUpdateNotificationSettings({ ...notificationSettings, minutesBefore: min })}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200
                        ${notificationSettings?.minutesBefore === min
                          ? 'bg-white text-emerald-700 shadow-sm dark:bg-zinc-700 dark:text-emerald-400'
                          : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                        }`}
                    >
                      {min} min
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Blocked notice */}
            {typeof Notification !== 'undefined' && Notification.permission === 'denied' && (
              <div className="px-5 py-3 text-xs text-amber-600 dark:text-amber-400">
                {t('settings.notifications_blocked')}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Preferences */}
      <section>
        <h2 className="mb-2 px-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">{t('settings.preferences')}</h2>
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {/* Dark mode row */}
          <div className="flex items-center gap-3 border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
            <img src="/logo.png" alt="" className="h-4 w-4" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t('settings.dark_mode')}</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                {dark ? t('settings.on') : t('settings.off')}
              </p>
            </div>
            <button
              onClick={onToggleTheme}
              role="switch"
              aria-checked={dark}
              className={`relative inline-flex h-[26px] w-[44px] shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200
                ${dark ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}
            >
              <motion.span
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={`inline-block h-[20px] w-[20px] rounded-full bg-white shadow-sm
                  ${dark ? 'ml-[21px]' : 'ml-[3px]'}`}
              />
            </button>
          </div>

          {/* Language row */}
          <div className="flex items-center gap-3 px-5 py-4">
            <Globe size={16} className="text-zinc-400 dark:text-zinc-500" strokeWidth={1.5} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t('settings.language')}</p>
            </div>
            <select
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="rounded-xl border border-zinc-200 bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 outline-none transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600"
            >
              {LANGUAGES.map(({ code, label }) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>
    </motion.div>
  )
}
