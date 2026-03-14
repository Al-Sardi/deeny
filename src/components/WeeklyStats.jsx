import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { TrendingUp, TrendingDown, Minus, Trophy, Star, Target } from 'lucide-react'
import { formatLocalDate } from '../lib/dateUtils'

const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

export default function WeeklyStats({ prayers, history, inline = false }) {
  const { t } = useTranslation()

  const report = useMemo(() => {
    const today = new Date()
    const todayStr = formatLocalDate(today)

    // Build last 7 days
    const last7 = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const dateStr = formatLocalDate(d)
      const dayOfWeek = d.getDay()

      if (dateStr === todayStr) {
        last7.push({ date: dateStr, prayers, dayOfWeek })
      } else {
        const found = history.find((h) => h.date === dateStr)
        last7.push({ date: dateStr, prayers: found?.prayers || {}, dayOfWeek })
      }
    }

    // Build previous 7 days for comparison
    const prev7 = []
    for (let i = 13; i >= 7; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const dateStr = formatLocalDate(d)
      const found = history.find((h) => h.date === dateStr)
      prev7.push({ date: dateStr, prayers: found?.prayers || {} })
    }

    // This week stats
    const thisWeekCompleted = last7.reduce(
      (sum, day) => sum + Object.values(day.prayers).filter(Boolean).length, 0
    )
    const thisWeekTotal = last7.length * 5
    const thisWeekPct = Math.round((thisWeekCompleted / thisWeekTotal) * 100)

    // Previous week stats
    const prevWeekCompleted = prev7.reduce(
      (sum, day) => sum + Object.values(day.prayers).filter(Boolean).length, 0
    )
    const prevWeekTotal = prev7.length * 5
    const prevWeekPct = prevWeekTotal > 0 ? Math.round((prevWeekCompleted / prevWeekTotal) * 100) : 0

    const change = thisWeekPct - prevWeekPct

    // Per-prayer stats
    const prayerStats = PRAYER_NAMES.map((name) => {
      const count = last7.filter((day) => day.prayers[name]).length
      const prevCount = prev7.filter((day) => day.prayers[name]).length
      return { name, count, total: 7, prevCount }
    })

    // Perfect days (all 5 prayed)
    const perfectDays = last7.filter(
      (day) => Object.values(day.prayers).filter(Boolean).length === 5
    ).length

    // Best prayer (highest count)
    const bestPrayer = [...prayerStats].sort((a, b) => b.count - a.count)[0]
    // Weakest prayer (lowest count)
    const weakestPrayer = [...prayerStats].sort((a, b) => a.count - b.count)[0]

    // Day grid for mini heatmap
    const dayGrid = last7.map((day) => ({
      dayKey: DAY_KEYS[day.dayOfWeek],
      completed: Object.values(day.prayers).filter(Boolean).length,
      total: 5,
    }))

    return {
      thisWeekCompleted,
      thisWeekTotal,
      thisWeekPct,
      prevWeekPct,
      change,
      prayerStats,
      perfectDays,
      bestPrayer,
      weakestPrayer,
      dayGrid,
    }
  }, [prayers, history])

  const {
    thisWeekCompleted, thisWeekTotal, thisWeekPct,
    change, prayerStats, perfectDays, bestPrayer, weakestPrayer, dayGrid,
  } = report

  const TrendIcon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus
  const trendColor = change > 0
    ? 'text-emerald-600 dark:text-emerald-400'
    : change < 0
      ? 'text-red-500 dark:text-red-400'
      : 'text-zinc-400 dark:text-zinc-500'

  const content = (
    <div className="space-y-5">
      {/* ── Header: Score + Trend ── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
              {thisWeekPct}%
            </span>
            <span className="text-sm text-zinc-400 dark:text-zinc-500">
              {t('weekly.completion')}
            </span>
          </div>
          <p className="mt-0.5 text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
            {thisWeekCompleted}/{thisWeekTotal} {t('weekly.prayers_completed')}
          </p>
        </div>
        <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
          change > 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' :
          change < 0 ? 'bg-red-50 dark:bg-red-900/20' :
          'bg-zinc-100 dark:bg-zinc-800'
        } ${trendColor}`}>
          <TrendIcon size={14} />
          {change > 0 ? '+' : ''}{change}% {t('weekly.vs_last_week')}
        </div>
      </div>

      {/* ── Mini day grid ── */}
      <div>
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          {t('weekly.daily_breakdown')}
        </p>
        <div className="grid grid-cols-7 gap-1.5">
          {dayGrid.map(({ dayKey, completed, total }, i) => {
            const pct = completed / total
            const bg = pct === 1
              ? 'bg-emerald-500'
              : pct >= 0.6
                ? 'bg-emerald-300 dark:bg-emerald-600'
                : pct > 0
                  ? 'bg-emerald-100 dark:bg-emerald-900'
                  : 'bg-zinc-100 dark:bg-zinc-800'
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                  {t(`weekly.${dayKey}`)}
                </span>
                <div className={`flex h-9 w-full items-center justify-center rounded-lg ${bg}`}>
                  <span className={`text-xs font-semibold tabular-nums ${
                    pct >= 0.6 ? 'text-white' : 'text-zinc-500 dark:text-zinc-400'
                  }`}>
                    {completed}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Per-prayer bars ── */}
      <div>
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          {t('weekly.per_prayer')}
        </p>
        <div className="space-y-2.5">
          {prayerStats.map(({ name, count, total, prevCount }) => {
            const pct = (count / total) * 100
            const diff = count - prevCount
            return (
              <div key={name} className="flex items-center gap-3">
                <span className="w-16 shrink-0 text-sm text-zinc-700 dark:text-zinc-300">{name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                    className={`h-full rounded-full ${
                      pct === 100 ? 'bg-emerald-500' :
                      pct >= 60 ? 'bg-emerald-400' :
                      'bg-amber-400'
                    }`}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                  {count}/7
                </span>
                {diff !== 0 && (
                  <span className={`text-[10px] tabular-nums ${
                    diff > 0 ? 'text-emerald-500' : 'text-red-400'
                  }`}>
                    {diff > 0 ? '+' : ''}{diff}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Highlights ── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-amber-50 p-3 text-center dark:bg-amber-900/15">
          <Trophy size={16} className="mx-auto mb-1 text-amber-500" />
          <p className="text-lg font-bold tabular-nums text-zinc-900 dark:text-zinc-100">{perfectDays}</p>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{t('weekly.perfect_days')}</p>
        </div>
        <div className="rounded-xl bg-emerald-50 p-3 text-center dark:bg-emerald-900/15">
          <Star size={16} className="mx-auto mb-1 text-emerald-500" />
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{bestPrayer.name}</p>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{t('weekly.best_prayer')}</p>
        </div>
        <div className="rounded-xl bg-orange-50 p-3 text-center dark:bg-orange-900/15">
          <Target size={16} className="mx-auto mb-1 text-orange-500" />
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{weakestPrayer.name}</p>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{t('weekly.focus_on')}</p>
        </div>
      </div>

      {/* ── Motivational message ── */}
      <div className="rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800/50">
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-300">
          {thisWeekPct >= 90 ? t('weekly.msg_excellent') :
           thisWeekPct >= 70 ? t('weekly.msg_good') :
           thisWeekPct >= 40 ? t('weekly.msg_improving') :
           t('weekly.msg_start')}
        </p>
      </div>
    </div>
  )

  if (inline) return <div>{content}</div>

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      {content}
    </motion.div>
  )
}
