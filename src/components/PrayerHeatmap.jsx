import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { getToday, formatLocalDate } from '../lib/dateUtils'

const DAYS = 91 // ~13 weeks
const COLS = Math.ceil(DAYS / 7)
const WEEK_LABELS = ['M', '', 'W', '', 'F', '', '']

function getCellColor(count) {
  if (count === undefined || count === null) return 'bg-zinc-100 dark:bg-zinc-800/50'
  if (count === 0) return 'bg-zinc-200 dark:bg-zinc-700'
  if (count <= 3) return 'bg-amber-300 dark:bg-amber-600'
  return 'bg-emerald-500 dark:bg-emerald-500'
}

export default function PrayerHeatmap({ prayers, history }) {
  const { grid, months } = useMemo(() => {
    // Build completion map from history + today
    const map = {}
    history.forEach((day) => {
      map[day.date] = Object.values(day.prayers).filter(Boolean).length
    })
    const todayStr = getToday()
    map[todayStr] = Object.values(prayers).filter(Boolean).length

    // Build grid: 7 rows (Mon→Sun) × N columns (weeks)
    // Start from (today - DAYS + 1) going forward
    const today = new Date()
    const start = new Date(today)
    start.setDate(today.getDate() - DAYS + 1)

    // Align start to Monday
    const dayOfWeek = start.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    start.setDate(start.getDate() + mondayOffset)

    const cells = [] // array of { date, count, row, col }
    const monthLabels = [] // { label, col }
    let lastMonth = -1
    const cursor = new Date(start)

    const totalWeeks = COLS + 1 // extra week for alignment
    for (let col = 0; col < totalWeeks; col++) {
      for (let row = 0; row < 7; row++) {
        const dateStr = formatLocalDate(cursor)
        const isFuture = cursor > today

        cells.push({
          dateStr,
          count: isFuture ? null : (map[dateStr] ?? undefined),
          row,
          col,
          isFuture,
        })

        // Track month labels
        if (row === 0 && cursor.getMonth() !== lastMonth) {
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          monthLabels.push({ label: monthNames[cursor.getMonth()], col })
          lastMonth = cursor.getMonth()
        }

        cursor.setDate(cursor.getDate() + 1)
      }
    }

    return { grid: cells, months: monthLabels }
  }, [prayers, history])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <p className="mb-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">
        Prayer Activity · Last 90 days
      </p>

      <div className="overflow-x-auto">
        <div className="inline-flex gap-3">
          {/* Week day labels */}
          <div className="flex flex-col gap-[3px] pt-5">
            {WEEK_LABELS.map((label, i) => (
              <div key={i} className="flex h-[12px] w-3 items-center justify-center">
                <span className="text-[9px] leading-none text-zinc-400 dark:text-zinc-500">{label}</span>
              </div>
            ))}
          </div>

          {/* Grid */}
          <div>
            {/* Month labels */}
            <div className="relative mb-1 h-4">
              {months.map(({ label, col }) => (
                <span
                  key={`${label}-${col}`}
                  className="absolute text-[10px] text-zinc-400 dark:text-zinc-500"
                  style={{ left: col * 15 }}
                >
                  {label}
                </span>
              ))}
            </div>

            {/* Cells */}
            <div className="flex gap-[3px]">
              {Array.from({ length: COLS + 1 }).map((_, col) => (
                <div key={col} className="flex flex-col gap-[3px]">
                  {Array.from({ length: 7 }).map((_, row) => {
                    const cell = grid.find((c) => c.row === row && c.col === col)
                    if (!cell || cell.isFuture) {
                      return <div key={row} className="h-[12px] w-[12px] rounded-sm bg-transparent" />
                    }
                    return (
                      <div
                        key={row}
                        className={`h-[12px] w-[12px] rounded-sm transition-colors ${getCellColor(cell.count)}`}
                        title={`${cell.dateStr}: ${cell.count ?? 0}/5 prayers`}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-end gap-1.5">
        <span className="mr-1 text-[10px] text-zinc-400 dark:text-zinc-500">Less</span>
        <div className="h-[10px] w-[10px] rounded-sm bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-[10px] w-[10px] rounded-sm bg-amber-300 dark:bg-amber-600" />
        <div className="h-[10px] w-[10px] rounded-sm bg-emerald-500" />
        <span className="ml-1 text-[10px] text-zinc-400 dark:text-zinc-500">More</span>
      </div>
    </motion.div>
  )
}
