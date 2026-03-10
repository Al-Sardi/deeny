import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Flame, Trophy, CalendarDays, Hash, Check, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  fetchUnlockedAchievements,
  insertAchievements,
  fetchPrayerStats,
  fetchTasbihTotal,
} from '../lib/supabaseAchievements'
import LevelCard from './LevelCard'
import ConsistencyScore from './ConsistencyScore'

const ACHIEVEMENTS = [
  { id: 'first-prayer', label: 'First Step', description: 'Complete your first prayer', icon: '🌱', check: (s) => s.totalPrayers >= 1 },
  { id: 'perfect-day', label: 'Perfect Day', description: 'Complete all 5 prayers in a day', icon: '⭐', check: (s) => s.perfectDays >= 1 },
  { id: 'streak-3', label: 'On Fire', description: 'Reach a 3-day streak', icon: '🔥', check: (s) => s.bestStreak >= 3 },
  { id: 'streak-7', label: 'Week Warrior', description: 'Reach a 7-day streak', icon: '🏅', check: (s) => s.bestStreak >= 7 },
  { id: 'streak-30', label: 'Unstoppable', description: 'Reach a 30-day streak', icon: '👑', check: (s) => s.bestStreak >= 30 },
  { id: 'prayers-50', label: 'Devoted', description: 'Complete 50 prayers total', icon: '🕌', check: (s) => s.totalPrayers >= 50 },
  { id: 'prayers-100', label: 'Centurion', description: 'Complete 100 prayers total', icon: '💯', check: (s) => s.totalPrayers >= 100 },
  { id: 'prayers-500', label: 'Faithful', description: 'Complete 500 prayers total', icon: '🌟', check: (s) => s.totalPrayers >= 500 },
  { id: 'tasbih-1000', label: 'Tasbih Master', description: 'Count 1,000 tasbih total', icon: '📿', check: (s) => s.tasbihTotal >= 1000 },
  { id: 'perfect-week', label: 'Perfect Week', description: 'Complete all prayers every day for a week', icon: '🏆', check: (s) => s.weeklyPerfect >= 7 },
]

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.3, ease: 'easeOut', delay: i * 0.04 },
  }),
}

export default function StreaksTab({ prayers, streak, history }) {
  const { user } = useAuth()
  const [stats, setStats] = useState({ totalPrayers: 0, bestStreak: 0, perfectDays: 0, weeklyPerfect: 0, tasbihTotal: 0 })
  const [unlocked, setUnlocked] = useState([])
  const [newlyUnlocked, setNewlyUnlocked] = useState([])
  const [dbStats, setDbStats] = useState(null)
  const [dbTasbihTotal, setDbTasbihTotal] = useState(0)
  const insertedRef = useRef(new Set())

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [achRes, statsRes, tasbihRes] = await Promise.all([
          fetchUnlockedAchievements(user.id),
          fetchPrayerStats(user.id),
          fetchTasbihTotal(user.id),
        ])
        if (cancelled) return
        if (achRes.data) { setUnlocked(achRes.data); achRes.data.forEach((id) => insertedRef.current.add(id)) }
        if (statsRes.stats) setDbStats(statsRes.stats)
        setDbTasbihTotal(tasbihRes.total ?? 0)
      } catch (err) { console.error('Failed to load achievements:', err) }

      try {
        const raw = localStorage.getItem('achievements-data')
        if (raw) {
          const saved = JSON.parse(raw)
          if (saved?.unlocked?.length > 0) await insertAchievements(user.id, saved.unlocked)
          localStorage.removeItem('achievements-data')
        }
      } catch { /* ignore */ }
    }
    load()
    return () => { cancelled = true }
  }, [user.id])

  useEffect(() => {
    const todayCompleted = Object.values(prayers).filter(Boolean).length
    const todayPerfect = todayCompleted === 5
    const baseTotalPrayers = dbStats?.totalPrayers ?? 0
    const basePerfectDays = dbStats?.perfectDays ?? 0
    const basebestStreak = dbStats?.bestStreak ?? 0
    const totalPrayers = Math.max(baseTotalPrayers, baseTotalPrayers)
    const perfectDays = basePerfectDays
    const bestStreak = Math.max(basebestStreak, streak + (todayPerfect ? 1 : 0))
    const recentHistory = history.slice(0, 6)
    const weeklyPerfect = recentHistory.filter((day) => Object.values(day.prayers).every(Boolean)).length + (todayPerfect ? 1 : 0)
    const newStats = { totalPrayers, bestStreak, perfectDays, weeklyPerfect, tasbihTotal: dbTasbihTotal }
    setStats(newStats)

    const freshUnlocks = ACHIEVEMENTS.filter(
      (a) => !unlocked.includes(a.id) && !insertedRef.current.has(a.id) && a.check(newStats)
    ).map((a) => a.id)

    if (freshUnlocks.length > 0) {
      const allUnlocked = [...unlocked, ...freshUnlocks]
      setUnlocked(allUnlocked)
      setNewlyUnlocked(freshUnlocks)
      freshUnlocks.forEach((id) => insertedRef.current.add(id))
      insertAchievements(user.id, freshUnlocks).catch(console.error)
      setTimeout(() => setNewlyUnlocked([]), 2000)
    }
  }, [prayers, streak, history, dbStats, dbTasbihTotal, unlocked, user.id])

  const todayComplete = Object.values(prayers).filter(Boolean).length === 5

  const statCards = [
    { Icon: Flame, iconClass: 'text-orange-500', value: streak + (todayComplete ? 1 : 0), label: 'Current streak' },
    { Icon: Trophy, iconClass: 'text-amber-500', value: stats.bestStreak, label: 'Best streak' },
    { Icon: CalendarDays, iconClass: 'text-blue-500', value: `${stats.weeklyPerfect}/7`, label: 'This week' },
    { Icon: Hash, iconClass: 'text-emerald-500', value: stats.totalPrayers, label: 'Total prayers' },
  ]

  return (
    <div className="space-y-6">
      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map(({ Icon, iconClass, value, label }, i) => (
          <motion.div
            key={label}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <Icon size={18} className={`mb-3 ${iconClass}`} strokeWidth={1.5} />
            <p className="text-2xl font-semibold tracking-tight text-zinc-900 tabular-nums dark:text-zinc-100">
              {value}
            </p>
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Level & Consistency */}
      <LevelCard prayers={prayers} history={history} />
      <ConsistencyScore prayers={prayers} history={history} />

      {/* Achievements */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Achievements
        </h2>
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {ACHIEVEMENTS.map((a, i) => {
            const isUnlocked = unlocked.includes(a.id)
            const isNew = newlyUnlocked.includes(a.id)
            const isLast = i === ACHIEVEMENTS.length - 1

            return (
              <motion.div
                key={a.id}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className={`flex items-center gap-4 px-5 py-3.5
                  ${!isLast ? 'border-b border-zinc-100 dark:border-zinc-800' : ''}
                  ${isNew ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''}`}
              >
                <span className={`text-xl transition-all ${isUnlocked ? '' : 'opacity-20 grayscale'}`}>
                  {a.icon}
                </span>

                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${isUnlocked ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 dark:text-zinc-600'}`}>
                    {a.label}
                  </p>
                  <p className={`text-xs ${isUnlocked ? 'text-zinc-500 dark:text-zinc-400' : 'text-zinc-300 dark:text-zinc-700'}`}>
                    {a.description}
                  </p>
                </div>

                {isUnlocked ? (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                    <Check size={12} strokeWidth={3} className="text-white" />
                  </div>
                ) : (
                  <Lock size={14} className="text-zinc-300 dark:text-zinc-700" strokeWidth={1.5} />
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
