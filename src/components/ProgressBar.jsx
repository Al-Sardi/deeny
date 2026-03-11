import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

export default function ProgressBar({ completed, total }) {
  const { t } = useTranslation()
  const pct = Math.round((completed / total) * 100)
  const done = completed === total

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.2 }}
      className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">{t('progress_bar.todays_progress')}</span>
        <span className={`text-sm tabular-nums ${done ? 'font-semibold text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-400'}`}>
          {completed}/{total}
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
          className="h-full rounded-full bg-emerald-500"
        />
      </div>

      {done && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-3 text-center text-sm font-medium text-emerald-600 dark:text-emerald-400"
        >
          {t('progress_bar.all_completed')}
        </motion.p>
      )}
    </motion.div>
  )
}
