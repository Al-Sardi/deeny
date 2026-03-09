/**
 * ProgressBar - Enhanced progress bar with smooth animation,
 * rounded corners, gradient fill, and percentage display.
 */
export default function ProgressBar({ completed, total }) {
  const percentage = Math.round((completed / total) * 100)
  const isComplete = completed === total

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
      <div className="mb-3 flex items-center justify-between text-sm font-medium text-gray-600 dark:text-gray-400">
        <span>Progress</span>
        <span className={isComplete ? 'text-green-600 dark:text-green-400 font-semibold' : ''}>
          {completed}/{total} — {percentage}%
        </span>
      </div>
      <div className="h-4 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            isComplete
              ? 'bg-gradient-to-r from-green-400 to-emerald-500'
              : 'bg-gradient-to-r from-green-400 to-green-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isComplete && (
        <p className="mt-2 text-center text-sm font-medium text-green-600 dark:text-green-400">
          All prayers completed!
        </p>
      )}
    </div>
  )
}
