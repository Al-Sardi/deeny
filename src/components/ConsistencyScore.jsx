import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'
import { formatLocalDate } from '../lib/dateUtils'

function getLabel(pct) {
  if (pct >= 90) return { text: 'Excellent', color: 'text-emerald-600 dark:text-emerald-400' }
  if (pct >= 75) return { text: 'Strong', color: 'text-blue-600 dark:text-blue-400' }
  if (pct >= 60) return { text: 'Improving', color: 'text-amber-600 dark:text-amber-400' }
  return { text: 'Needs focus', color: 'text-zinc-500 dark:text-zinc-400' }
}

export default function ConsistencyScore({ prayers, history }) {
  const { percentage, label } = useMemo(() => {
    const today = new Date()
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(today.getDate() - 29)
    const cutoff = formatLocalDate(thirtyDaysAgo)

    // Count from history (past days within 30-day window)
    let completed = 0
    let totalDays = 0

    history.forEach((day) => {
      if (day.date >= cutoff) {
        const count = Object.values(day.prayers).filter(Boolean).length
        completed += count
        totalDays++
      }
    })

    // Add today
    const todayCompleted = Object.values(prayers).filter(Boolean).length
    completed += todayCompleted
    totalDays++

    const totalPossible = totalDays * 5
    const pct = totalPossible > 0 ? Math.round((completed / totalPossible) * 100) : 0

    return { percentage: pct, label: getLabel(pct) }
  }, [prayers, history])

  // SVG ring
  const radius = 38
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.06 }}
      className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex items-center gap-2 mb-5">
        <Activity size={16} className="text-emerald-500" strokeWidth={1.5} />
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Consistency · Last 30 days</span>
      </div>

      <div className="flex items-center gap-6">
        {/* Ring */}
        <div className="relative flex shrink-0 items-center justify-center">
          <svg width="88" height="88" viewBox="0 0 88 88">
            <circle
              cx="44" cy="44" r={radius}
              fill="none" stroke="currentColor" strokeWidth="5"
              className="text-zinc-100 dark:text-zinc-800"
            />
            <motion.circle
              cx="44" cy="44" r={radius}
              fill="none" stroke="currentColor" strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-emerald-500 -rotate-90 origin-center"
            />
          </svg>
          <span className="absolute text-lg font-semibold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-100">
            {percentage}%
          </span>
        </div>

        {/* Label */}
        <div>
          <p className={`text-base font-medium ${label.color}`}>
            {label.text}
          </p>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            Based on your prayer completion over the last 30 days
          </p>
        </div>
      </div>
    </motion.div>
  )
}
