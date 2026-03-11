import { motion } from 'framer-motion'
import { Flame, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function Header({ streak, nextPrayer, nextPrayerTime, loading, error }) {
  const { t } = useTranslation()

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mb-8 space-y-5"
    >
      {/* Title row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Deeny" className="h-8 w-8" />
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Deeny
          </h1>
        </div>

        {/* Streak badge — inline, not a separate card */}
        {streak !== undefined && (
          <div className="flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 dark:bg-orange-950/40">
            <Flame size={14} className="text-orange-500" fill="currentColor" />
            <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
              {streak}
            </span>
          </div>
        )}
      </div>

      {/* Next prayer — subtle, part of the page flow */}
      {loading && (
        <div className="flex items-center gap-2">
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-zinc-300 border-t-transparent dark:border-zinc-600" />
          <span className="text-sm text-zinc-400 dark:text-zinc-500">{t('header.loading_prayer_times')}</span>
        </div>
      )}

      {error && (
        <p className="text-sm text-zinc-400 dark:text-zinc-500">{error}</p>
      )}

      {!loading && !error && nextPrayer && (
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <Clock size={14} strokeWidth={1.5} />
          <span>
            {t('header.next')} <span className="font-medium text-zinc-900 dark:text-zinc-100">{nextPrayer}</span>
            {' '}{t('header.at')}{' '}
            <span className="font-medium text-emerald-600 dark:text-emerald-400">{nextPrayerTime}</span>
          </span>
        </div>
      )}

      {!loading && !error && !nextPrayer && nextPrayer !== undefined && (
        <p className="text-sm text-zinc-400 dark:text-zinc-500">{t('header.all_prayers_passed')}</p>
      )}
    </motion.header>
  )
}
