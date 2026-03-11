import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function getConsistencyColor(pct) {
  if (pct >= 90) return 'text-emerald-600 dark:text-emerald-400'
  if (pct >= 75) return 'text-blue-600 dark:text-blue-400'
  if (pct >= 60) return 'text-amber-600 dark:text-amber-400'
  return 'text-zinc-500 dark:text-zinc-400'
}

export default function PrayerJourney({ prayers, history, inline = false }) {
  const months = useMemo(() => {
    // Group history + today by month
    const buckets = {}

    // Add today
    const todayStr = new Date().toISOString().split('T')[0]
    const todayMonth = todayStr.slice(0, 7) // "YYYY-MM"
    const todayCompleted = Object.values(prayers).filter(Boolean).length
    const todayPerfect = todayCompleted === 5

    buckets[todayMonth] = {
      totalPrayers: todayCompleted,
      totalDays: 1,
      perfectDays: todayPerfect ? 1 : 0,
    }

    // Add history
    history.forEach((day) => {
      const monthKey = day.date.slice(0, 7)
      if (!buckets[monthKey]) {
        buckets[monthKey] = { totalPrayers: 0, totalDays: 0, perfectDays: 0 }
      }
      const count = Object.values(day.prayers).filter(Boolean).length
      buckets[monthKey].totalPrayers += count
      buckets[monthKey].totalDays += 1
      if (count === 5) buckets[monthKey].perfectDays += 1
    })

    // Convert to sorted array (newest first)
    return Object.entries(buckets)
      .map(([key, data]) => {
        const [year, month] = key.split('-').map(Number)
        const totalPossible = data.totalDays * 5
        const consistency = totalPossible > 0 ? Math.round((data.totalPrayers / totalPossible) * 100) : 0

        return {
          key,
          label: `${MONTH_NAMES[month - 1]} ${year}`,
          consistency,
          totalPrayers: data.totalPrayers,
          perfectDays: data.perfectDays,
        }
      })
      .sort((a, b) => b.key.localeCompare(a.key))
  }, [prayers, history])

  if (months.length === 0) return null

  const monthCards = (
    <div className="space-y-3">
      {months.map(({ key, label, consistency, totalPrayers, perfectDays }, i) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: i * 0.04 }}
          className={`rounded-xl bg-zinc-50 px-4 py-3.5 dark:bg-zinc-800/50 ${i === 0 ? 'ring-1 ring-emerald-500/20' : ''}`}
        >
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{label}</p>

          <div className="mt-2 flex items-center gap-5">
            <div>
              <span className={`text-lg font-semibold tabular-nums tracking-tight ${getConsistencyColor(consistency)}`}>
                {consistency}%
              </span>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500">Consistency</p>
            </div>
            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700" />
            <div>
              <span className="text-lg font-semibold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-100">
                {totalPrayers}
              </span>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500">Prayers</p>
            </div>
            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700" />
            <div>
              <span className="text-lg font-semibold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-100">
                {perfectDays}
              </span>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500">Perfect days</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )

  if (inline) return monthCards

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="mb-5 flex items-center gap-2">
        <TrendingUp size={16} className="text-emerald-500" strokeWidth={1.5} />
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Prayer Journey</span>
      </div>
      {monthCards}
    </motion.div>
  )
}
