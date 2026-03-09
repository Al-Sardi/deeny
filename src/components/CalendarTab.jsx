import { useState, useMemo } from 'react'

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/**
 * Build a lookup map: "YYYY-MM-DD" → number of completed prayers.
 * Merges history entries with today's live prayer state.
 */
function buildCompletionMap(prayers, history) {
  const map = {}

  // Add historical days
  history.forEach((day) => {
    const count = Object.values(day.prayers).filter(Boolean).length
    map[day.date] = count
  })

  // Add today's live data
  const today = new Date().toISOString().split('T')[0]
  map[today] = Object.values(prayers).filter(Boolean).length

  return map
}

/**
 * Get the number of days in a given month (0-indexed month).
 */
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

/**
 * Get the weekday of the first day of the month (0=Mon, 6=Sun).
 * JS Date.getDay() returns 0=Sun, so we adjust.
 */
function getFirstDayOffset(year, month) {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1 // Convert Sun=0 → 6, Mon=1 → 0
}

/**
 * Format date as "YYYY-MM-DD" for a given year, month (0-indexed), and day.
 */
function formatDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/**
 * Get cell background color based on prayer completion count.
 * 0 → gray, 1-4 → amber/yellow, 5 → green
 */
function getCellColor(count, isToday) {
  if (count === undefined) return ''
  if (count === 5) return 'bg-green-100 dark:bg-green-900/40'
  if (count > 0) return 'bg-amber-50 dark:bg-amber-900/30'
  return 'bg-gray-100 dark:bg-gray-800'
}

function getCellTextColor(count) {
  if (count === undefined) return 'text-gray-300 dark:text-gray-700'
  if (count === 5) return 'text-green-700 dark:text-green-300'
  if (count > 0) return 'text-amber-700 dark:text-amber-300'
  return 'text-gray-500 dark:text-gray-400'
}

/**
 * CalendarTab - Monthly prayer calendar showing completion per day.
 * Navigate between months with arrows. Days are color-coded by completion.
 */
export default function CalendarTab({ prayers, history }) {
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())

  // Build the date → count lookup from history + today's prayers
  const completionMap = useMemo(
    () => buildCompletionMap(prayers, history),
    [prayers, history]
  )

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDayOffset = getFirstDayOffset(viewYear, viewMonth)
  const todayStr = now.toISOString().split('T')[0]

  // Check if we can go forward (not past current month)
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth()

  /** Navigate to previous month */
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1)
      setViewMonth(11)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  /** Navigate to next month (capped at current) */
  const nextMonth = () => {
    if (isCurrentMonth) return
    if (viewMonth === 11) {
      setViewYear((y) => y + 1)
      setViewMonth(0)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  // Build grid cells: empty slots for offset + actual day cells
  const cells = []
  for (let i = 0; i < firstDayOffset; i++) {
    cells.push(null) // empty slot
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDate(viewYear, viewMonth, day)
    const count = completionMap[dateStr]
    const isToday = dateStr === todayStr
    const isFuture = dateStr > todayStr
    cells.push({ day, dateStr, count, isToday, isFuture })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Month navigation header */}
      <div className="flex items-center justify-between rounded-xl bg-white px-5 py-4 shadow-sm dark:bg-gray-800">
        <button
          onClick={prevMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>

        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </h2>

        <button
          onClick={nextMonth}
          disabled={isCurrentMonth}
          className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors
            ${isCurrentMonth
              ? 'text-gray-200 dark:text-gray-700 cursor-not-allowed'
              : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Calendar grid */}
      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
        {/* Weekday headers */}
        <div className="mb-2 grid grid-cols-7 gap-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-400 dark:text-gray-500">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, i) => {
            if (!cell) {
              // Empty offset cell
              return <div key={`empty-${i}`} />
            }

            const { day, count, isToday, isFuture } = cell

            return (
              <div
                key={day}
                className={`relative flex flex-col items-center justify-center rounded-lg py-2 transition-all duration-300
                  ${isFuture
                    ? '' // no bg for future days
                    : getCellColor(count, isToday)
                  }
                  ${isToday ? 'ring-2 ring-green-500 ring-offset-1 ring-offset-white dark:ring-offset-gray-800' : ''}`}
              >
                {/* Day number */}
                <span
                  className={`text-sm font-semibold
                    ${isFuture
                      ? 'text-gray-300 dark:text-gray-700'
                      : isToday
                        ? 'text-green-600 dark:text-green-400'
                        : count !== undefined
                          ? getCellTextColor(count)
                          : 'text-gray-500 dark:text-gray-400'
                    }`}
                >
                  {day}
                </span>

                {/* Completion count — only for days with data */}
                {!isFuture && count !== undefined && (
                  <span
                    className={`text-[10px] leading-none font-medium
                      ${count === 5
                        ? 'text-green-600 dark:text-green-400'
                        : count > 0
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-gray-400 dark:text-gray-600'
                      }`}
                  >
                    {count}/5
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-green-100 dark:bg-green-900/40" />
          <span className="text-xs text-gray-400 dark:text-gray-500">5/5</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-amber-50 dark:bg-amber-900/30" />
          <span className="text-xs text-gray-400 dark:text-gray-500">1–4</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-gray-100 dark:bg-gray-700" />
          <span className="text-xs text-gray-400 dark:text-gray-500">0</span>
        </div>
      </div>
    </div>
  )
}
