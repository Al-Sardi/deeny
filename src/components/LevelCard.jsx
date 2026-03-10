import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

/**
 * XP rules:
 *   1 prayer completed = 10 XP
 *   All 5 prayers in a day = +60 XP bonus
 */

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

  const currentIdx = LEVELS.findIndex((l) => l.level === current.level)
  const next = currentIdx < LEVELS.length - 1 ? LEVELS[currentIdx + 1] : null
  const progress = next
    ? (xp - current.xp) / (next.xp - current.xp)
    : 1

  return { ...current, next, progress: Math.min(progress, 1) }
}

function calculateXP(prayers, history) {
  let xp = 0

  // Today
  const todayCompleted = Object.values(prayers).filter(Boolean).length
  xp += todayCompleted * 10
  if (todayCompleted === 5) xp += 60

  // History
  history.forEach((day) => {
    const count = Object.values(day.prayers).filter(Boolean).length
    xp += count * 10
    if (count === 5) xp += 60
  })

  return xp
}

export default function LevelCard({ prayers, history }) {
  const { xp, level, title, next, progress } = useMemo(() => {
    const totalXP = calculateXP(prayers, history)
    const info = getLevelInfo(totalXP)
    return { xp: totalXP, ...info }
  }, [prayers, history])

  const xpToNext = next ? next.xp - xp : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/30">
            <Zap size={20} className="text-amber-500" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-2xl font-semibold tracking-tight text-zinc-900 tabular-nums dark:text-zinc-100">
              Level {level}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{title}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold tracking-tight text-zinc-900 tabular-nums dark:text-zinc-100">
            {xp.toLocaleString()}
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">XP</p>
        </div>
      </div>

      {/* Progress bar */}
      {next && (
        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
              Level {level}
            </span>
            <span className="text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
              Level {next.level}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <motion.div
              className="h-full rounded-full bg-amber-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <p className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-500">
            <span className="tabular-nums font-medium text-zinc-500 dark:text-zinc-400">{xpToNext.toLocaleString()}</span> XP to next level
          </p>
        </div>
      )}

      {!next && (
        <p className="mt-4 text-center text-sm font-medium text-amber-600 dark:text-amber-400">
          Max level reached!
        </p>
      )}
    </motion.div>
  )
}
