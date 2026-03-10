import { motion } from 'framer-motion'

const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']

export default function WeeklyStats({ prayers, history }) {
  const allDays = [{ prayers }, ...history]
  const totalDays = allDays.length

  const stats = PRAYER_NAMES.map((name) => ({
    name,
    count: allDays.filter((day) => day.prayers[name]).length,
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h2 className="mb-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
        Weekly overview
        <span className="ml-1 text-zinc-400 dark:text-zinc-500">
          · {totalDays} {totalDays === 1 ? 'day' : 'days'}
        </span>
      </h2>
      <div className="space-y-3">
        {stats.map(({ name, count }) => (
          <div key={name} className="flex items-center gap-3">
            <span className="w-16 shrink-0 text-sm text-zinc-700 dark:text-zinc-300">{name}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${totalDays > 0 ? (count / totalDays) * 100 : 0}%` }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
                className="h-full rounded-full bg-emerald-500"
              />
            </div>
            <span className="w-7 shrink-0 text-right text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
              {count}/{totalDays}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
