/**
 * PrayerItem - A single prayer toggle button with smooth animations.
 * Uses CSS transitions for background, border, and scale on toggle.
 */
export default function PrayerItem({ name, completed, onToggle, time }) {
  return (
    <button
      onClick={onToggle}
      className={`flex w-full items-center justify-between rounded-xl border-2 px-5 py-4 text-lg font-medium
        transition-all duration-300 ease-in-out
        ${
          completed
            ? 'border-green-500 bg-green-50 text-green-700 shadow-sm shadow-green-100 scale-[1.02] dark:bg-green-950 dark:text-green-300 dark:shadow-green-900/20'
            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 scale-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600'
        }`}
    >
      <span className="transition-colors duration-300">{name}</span>

      <div className="flex items-center gap-3">
        {/* Prayer time — shown when API data is available */}
        {time && (
          <span className="text-xs font-normal text-gray-400 dark:text-gray-500">
            {time}
          </span>
        )}

        {/* Animated checkbox indicator */}
        <span
        className={`flex h-7 w-7 items-center justify-center rounded-full border-2
          transition-all duration-300 ease-in-out
          ${
            completed
              ? 'border-green-500 bg-green-500 text-white rotate-0'
              : 'border-gray-300 rotate-90 dark:border-gray-600'
          }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 transition-all duration-300 ${
            completed ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
        </span>
      </div>
    </button>
  )
}
