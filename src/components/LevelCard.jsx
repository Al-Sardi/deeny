import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

/**
 * XP rules:
 *   1 prayer completed = 10 XP
 *   All 5 prayers in a day = +60 XP bonus
 *
 * Levels:
 *   1=0  2=100  3=300  4=600  5=1000
 *   6+ = continues with 500 XP per level
 */

const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000]

function getThreshold(level) {
  if (level <= LEVEL_THRESHOLDS.length) return LEVEL_THRESHOLDS[level - 1]
  return 1000 + (level - 5) * 500
}

function getLevelFromXP(xp) {
  let level = 1
  while (xp >= getThreshold(level + 1)) level++
  return level
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
  const { xp, level, currentThreshold, nextThreshold, progress } = useMemo(() => {
    const totalXP = calculateXP(prayers, history)
    const lvl = getLevelFromXP(totalXP)
    const curr = getThreshold(lvl)
    const next = getThreshold(lvl + 1)
    const prog = next > curr ? (totalXP - curr) / (next - curr) : 1

    return {
      xp: totalXP,
      level: lvl,
      currentThreshold: curr,
      nextThreshold: next,
      progress: Math.min(prog, 1),
    }
  }, [prayers, history])

  const xpToNext = nextThreshold - xp

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
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Level</p>
            <p className="text-2xl font-semibold tracking-tight text-zinc-900 tabular-nums dark:text-zinc-100">
              {level}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-400 dark:text-zinc-500">Total XP</p>
          <p className="text-lg font-semibold tracking-tight text-zinc-900 tabular-nums dark:text-zinc-100">
            {xp.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-5">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
            Level {level}
          </span>
          <span className="text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
            Level {level + 1}
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
    </motion.div>
  )
}
