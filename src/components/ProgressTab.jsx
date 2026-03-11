import { motion } from 'framer-motion'
import { Flame, Trophy, CalendarDays, Hash } from 'lucide-react'
import LevelCard from './LevelCard'
import ConsistencyScore from './ConsistencyScore'
import PrayerHeatmap from './PrayerHeatmap'
import PrayerCalendar from './PrayerCalendar'
import PrayerJourney from './PrayerJourney'
import WeeklyStats from './WeeklyStats'
import Achievements from './Achievements'

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.3, ease: 'easeOut', delay: i * 0.04 },
  }),
}

export default function ProgressTab({ prayers, streak, history }) {
  const todayComplete = Object.values(prayers).filter(Boolean).length === 5

  const statCards = [
    { Icon: Flame, iconClass: 'text-orange-500', value: streak + (todayComplete ? 1 : 0), label: 'Current streak' },
    { Icon: Trophy, iconClass: 'text-amber-500', value: 0, label: 'Best streak' },
    { Icon: CalendarDays, iconClass: 'text-blue-500', value: '0/7', label: 'This week' },
    { Icon: Hash, iconClass: 'text-emerald-500', value: 0, label: 'Total prayers' },
  ]

  // Compute stat values from history
  const todayCompleted = Object.values(prayers).filter(Boolean).length
  const todayPerfect = todayCompleted === 5
  const recentHistory = history.slice(0, 6)
  const weeklyPerfect = recentHistory.filter((day) => Object.values(day.prayers).every(Boolean)).length + (todayPerfect ? 1 : 0)

  // Total prayers from history + today
  let totalPrayers = todayCompleted
  let perfectDays = todayPerfect ? 1 : 0
  let bestStreak = streak + (todayPerfect ? 1 : 0)
  history.forEach((day) => {
    const count = Object.values(day.prayers).filter(Boolean).length
    totalPrayers += count
    if (count === 5) perfectDays++
  })

  statCards[1].value = bestStreak
  statCards[2].value = `${weeklyPerfect}/7`
  statCards[3].value = totalPrayers

  return (
    <div className="space-y-6">
      {/* Section 1 — Motivation: Stat grid + Level */}
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

      <LevelCard prayers={prayers} history={history} />

      {/* Section 2 — Performance */}
      <ConsistencyScore prayers={prayers} history={history} />

      {/* Section 3 — Activity */}
      <PrayerHeatmap prayers={prayers} history={history} />

      {/* Section 4 — Calendar */}
      <PrayerCalendar prayers={prayers} history={history} />

      {/* Section 5 — Journey / History */}
      <PrayerJourney prayers={prayers} history={history} />

      {/* Weekly overview */}
      <WeeklyStats prayers={prayers} history={history} />

      {/* Section 6 — Achievements */}
      <Achievements prayers={prayers} streak={streak} history={history} />
    </div>
  )
}
