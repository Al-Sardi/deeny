/**
 * NextPrayer - Displays the next upcoming prayer name and time.
 * Handles loading, error, and "all passed" states.
 */
export default function NextPrayer({ nextPrayer, nextPrayerTime, loading, error }) {
  if (loading) {
    return (
      <div className="w-full rounded-xl bg-white px-5 py-4 shadow-sm dark:bg-gray-800">
        <div className="flex items-center justify-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
          <span className="text-sm text-gray-400 dark:text-gray-500">
            Loading prayer times...
          </span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full rounded-xl bg-white px-5 py-4 shadow-sm dark:bg-gray-800">
        <p className="text-center text-sm text-gray-400 dark:text-gray-500">
          {error}
        </p>
      </div>
    )
  }

  if (!nextPrayer) {
    return (
      <div className="w-full rounded-xl bg-white px-5 py-4 shadow-sm dark:bg-gray-800">
        <p className="text-center text-sm font-medium text-green-600 dark:text-green-400">
          All prayer times have passed for today
        </p>
      </div>
    )
  }

  return (
    <div className="w-full rounded-xl bg-white px-5 py-4 shadow-sm dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Next Prayer
        </span>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {nextPrayer}
          </span>
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            {nextPrayerTime}
          </span>
        </div>
      </div>
    </div>
  )
}
