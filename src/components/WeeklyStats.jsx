const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']

/**
 * WeeklyStats - Shows per-prayer completion counts over the last 7 days.
 * Combines today's live prayer state with archived history for the count.
 */
export default function WeeklyStats({ prayers, history }) {
  // Today (live) + past days = full window (up to 7 days)
  const allDays = [{ prayers }, ...history]
  const totalDays = allDays.length

  const stats = PRAYER_NAMES.map((name) => ({
    name,
    count: allDays.filter((day) => day.prayers[name]).length,
  }))

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
      <h2 className="mb-4 text-sm font-medium text-gray-600 dark:text-gray-400">
        Weekly Stats{' '}
        <span className="text-gray-400 dark:text-gray-500">
          ({totalDays} {totalDays === 1 ? 'day' : 'days'})
        </span>
      </h2>
      <div className="flex flex-col gap-3">
        {stats.map(({ name, count }) => (
          <div key={name} className="flex items-center justify-between gap-3">
            <span className="w-16 shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
              {name}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500"
                style={{ width: `${totalDays > 0 ? (count / totalDays) * 100 : 0}%` }}
              />
            </div>
            <span className="w-8 shrink-0 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">
              {count}/{totalDays}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
