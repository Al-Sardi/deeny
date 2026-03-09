/**
 * StreakCounter - Displays the user's consecutive-days streak.
 * A streak increments when all 5 prayers are completed in a day.
 */
export default function StreakCounter({ streak }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 shadow-sm dark:bg-gray-800">
      <span className="text-2xl" role="img" aria-label="fire">
        🔥
      </span>
      <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
        Current Streak:{' '}
        <span className="text-green-600 dark:text-green-400">{streak}</span>{' '}
        {streak === 1 ? 'day' : 'days'}
      </span>
    </div>
  )
}
