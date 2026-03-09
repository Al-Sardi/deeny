/**
 * Header - App title, streak display, and theme toggle.
 */
import StreakCounter from './StreakCounter'
import ThemeToggle from './ThemeToggle'
import NextPrayer from './NextPrayer'

export default function Header({ streak, dark, onToggleTheme, nextPrayer, nextPrayerTime, loading, error }) {
  return (
    <div className="mb-8 flex flex-col items-center gap-4">
      <div className="flex w-full items-center justify-between">
        <div className="w-9" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Deeny
        </h1>
        <ThemeToggle dark={dark} onToggle={onToggleTheme} />
      </div>
      <StreakCounter streak={streak} />
      <NextPrayer
        nextPrayer={nextPrayer}
        nextPrayerTime={nextPrayerTime}
        loading={loading}
        error={error}
      />
    </div>
  )
}
