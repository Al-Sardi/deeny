import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import PrayerHeatmap from './PrayerHeatmap'

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function buildCompletionMap(prayers, history) {
  const map = {}
  history.forEach((day) => {
    map[day.date] = Object.values(day.prayers).filter(Boolean).length
  })
  const today = new Date().toISOString().split('T')[0]
  map[today] = Object.values(prayers).filter(Boolean).length
  return map
}

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate() }
function getFirstDayOffset(year, month) { const d = new Date(year, month, 1).getDay(); return d === 0 ? 6 : d - 1 }
function formatDate(year, month, day) { return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` }

function getCellBg(count) {
  if (count === undefined) return ''
  if (count === 5) return 'bg-emerald-100 dark:bg-emerald-900/30'
  if (count > 0) return 'bg-amber-50 dark:bg-amber-900/20'
  return 'bg-zinc-100 dark:bg-zinc-800'
}

function getCellText(count) {
  if (count === undefined) return 'text-zinc-300 dark:text-zinc-700'
  if (count === 5) return 'text-emerald-700 dark:text-emerald-300'
  if (count > 0) return 'text-amber-700 dark:text-amber-300'
  return 'text-zinc-500 dark:text-zinc-400'
}

export default function CalendarTab({ prayers, history, children }) {
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())

  const completionMap = useMemo(() => buildCompletionMap(prayers, history), [prayers, history])
  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDayOffset = getFirstDayOffset(viewYear, viewMonth)
  const todayStr = now.toISOString().split('T')[0]
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth()

  const prevMonth = () => { if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) } else setViewMonth(m => m - 1) }
  const nextMonth = () => { if (isCurrentMonth) return; if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) } else setViewMonth(m => m + 1) }

  const cells = []
  for (let i = 0; i < firstDayOffset; i++) cells.push(null)
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDate(viewYear, viewMonth, day)
    cells.push({ day, dateStr, count: completionMap[dateStr], isToday: dateStr === todayStr, isFuture: dateStr > todayStr })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-4"
    >
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
          <ChevronLeft size={18} />
        </button>
        <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-100">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </h2>
        <button onClick={nextMonth} disabled={isCurrentMonth} className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${isCurrentMonth ? 'text-zinc-200 dark:text-zinc-700 cursor-not-allowed' : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-2 grid grid-cols-7 gap-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-[11px] font-medium text-zinc-400 dark:text-zinc-500">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, i) => {
            if (!cell) return <div key={`e-${i}`} />
            const { day, count, isToday, isFuture } = cell
            return (
              <div
                key={day}
                className={`flex flex-col items-center justify-center rounded-lg py-1.5 transition-all
                  ${isFuture ? '' : getCellBg(count)}
                  ${isToday ? 'ring-1.5 ring-emerald-500 ring-offset-1 ring-offset-white dark:ring-offset-zinc-900' : ''}`}
              >
                <span className={`text-sm font-medium ${isFuture ? 'text-zinc-300 dark:text-zinc-700' : isToday ? 'text-emerald-600 dark:text-emerald-400' : count !== undefined ? getCellText(count) : 'text-zinc-500 dark:text-zinc-400'}`}>
                  {day}
                </span>
                {!isFuture && count !== undefined && (
                  <span className={`text-[9px] leading-none font-medium ${count === 5 ? 'text-emerald-600 dark:text-emerald-400' : count > 0 ? 'text-amber-500 dark:text-amber-400' : 'text-zinc-400 dark:text-zinc-600'}`}>
                    {count}/5
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-5">
        {[
          { color: 'bg-emerald-100 dark:bg-emerald-900/30', label: 'All 5' },
          { color: 'bg-amber-50 dark:bg-amber-900/20', label: 'Partial' },
          { color: 'bg-zinc-100 dark:bg-zinc-800', label: 'None' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`h-2.5 w-2.5 rounded-sm ${color}`} />
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500">{label}</span>
          </div>
        ))}
      </div>

      <PrayerHeatmap prayers={prayers} history={history} />

      {children}
    </motion.div>
  )
}
