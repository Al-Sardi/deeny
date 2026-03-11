import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Flame, Zap, Activity } from 'lucide-react'

/* ── Level helpers (same logic as LevelCard) ── */

const LEVELS = [
  { level: 1,  xp: 0,    title: 'Seeker' },
  { level: 2,  xp: 100,  title: 'Seeker' },
  { level: 3,  xp: 300,  title: 'Consistent' },
  { level: 4,  xp: 600,  title: 'Consistent' },
  { level: 5,  xp: 1000, title: 'Devoted' },
  { level: 6,  xp: 1500, title: 'Devoted' },
  { level: 7,  xp: 2100, title: 'Disciplined' },
  { level: 8,  xp: 2800, title: 'Disciplined' },
  { level: 9,  xp: 3600, title: 'Disciplined' },
  { level: 10, xp: 4500, title: 'Guardian of Salah' },
]

function getLevelInfo(xp) {
  let current = LEVELS[0]
  for (const lvl of LEVELS) {
    if (xp >= lvl.xp) current = lvl
    else break
  }
  const idx = LEVELS.findIndex((l) => l.level === current.level)
  const next = idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null
  const progress = next ? (xp - current.xp) / (next.xp - current.xp) : 1
  return { ...current, next, progress: Math.min(progress, 1) }
}

function calculateXP(prayers, history) {
  let xp = 0
  const todayCompleted = Object.values(prayers).filter(Boolean).length
  xp += todayCompleted * 10
  if (todayCompleted === 5) xp += 60
  history.forEach((day) => {
    const count = Object.values(day.prayers).filter(Boolean).length
    xp += count * 10
    if (count === 5) xp += 60
  })
  return xp
}

/* ── Consistency helpers (same logic as ConsistencyScore) ── */

function getConsistencyLabel(pct) {
  if (pct >= 90) return { text: 'Excellent', color: 'text-emerald-600 dark:text-emerald-400' }
  if (pct >= 75) return { text: 'Strong', color: 'text-blue-600 dark:text-blue-400' }
  if (pct >= 60) return { text: 'Improving', color: 'text-amber-600 dark:text-amber-400' }
  return { text: 'Needs focus', color: 'text-zinc-500 dark:text-zinc-400' }
}

function calculateConsistency(prayers, history) {
  const today = new Date()
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 29)
  const cutoff = thirtyDaysAgo.toISOString().split('T')[0]

  let completed = 0
  let totalDays = 0
  history.forEach((day) => {
    if (day.date >= cutoff) {
      completed += Object.values(day.prayers).filter(Boolean).length
      totalDays++
    }
  })
  completed += Object.values(prayers).filter(Boolean).length
  totalDays++

  const totalPossible = totalDays * 5
  return totalPossible > 0 ? Math.round((completed / totalPossible) * 100) : 0
}

/* ── Component ── */

export default function ProgressOverview({ prayers, streak, history }) {
  const todayComplete = Object.values(prayers).filter(Boolean).length === 5
  const currentStreak = streak + (todayComplete ? 1 : 0)

  const { level, title, xp, progress, next } = useMemo(() => {
    const totalXP = calculateXP(prayers, history)
    const info = getLevelInfo(totalXP)
    return { xp: totalXP, ...info }
  }, [prayers, history])

  const { percentage, label } = useMemo(() => {
    const pct = calculateConsistency(prayers, history)
    return { percentage: pct, label: getConsistencyLabel(pct) }
  }, [prayers, history])

  // Mini SVG ring for consistency
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h3 className="mb-5 text-sm font-medium text-zinc-500 dark:text-zinc-400">
        Your Progress
      </h3>

      {/* Three metrics in a row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Streak */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-900/20">
            <Flame size={18} className="text-orange-500" strokeWidth={1.5} />
          </div>
          <p className="text-2xl font-semibold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-100">
            {currentStreak}
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            day streak
          </p>
        </div>

        {/* Level */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/20">
            <Zap size={18} className="text-amber-500" strokeWidth={1.5} />
          </div>
          <p className="text-2xl font-semibold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-100">
            {level}
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {title}
          </p>
        </div>

        {/* Consistency */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-2 flex h-10 w-10 items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 40 40">
              <circle
                cx="20" cy="20" r={radius}
                fill="none" stroke="currentColor" strokeWidth="3"
                className="text-zinc-100 dark:text-zinc-800"
              />
              <motion.circle
                cx="20" cy="20" r={radius}
                fill="none" stroke="currentColor" strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="text-emerald-500 -rotate-90 origin-center"
              />
            </svg>
          </div>
          <p className="text-2xl font-semibold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-100">
            {percentage}%
          </p>
          <p className={`text-[11px] ${label.color}`}>
            {label.text}
          </p>
        </div>
      </div>

      {/* XP progress bar */}
      {next && (
        <div className="mt-5">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
              {xp.toLocaleString()} XP
            </span>
            <span className="text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
              Level {next.level}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <motion.div
              className="h-full rounded-full bg-amber-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}
    </motion.div>
  )
}
