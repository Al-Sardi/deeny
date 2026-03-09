import PrayerItem from './PrayerItem'

const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']

/** Format "HH:MM" keeping 24h format (strip leading zero) */
function formatTime(timeStr) {
  if (!timeStr) return undefined
  const [h, m] = timeStr.split(':').map(Number)
  return `${h}:${String(m).padStart(2, '0')}`
}

/**
 * PrayerList - Renders the 5 daily prayers with an optional reset button.
 */
export default function PrayerList({ prayers, onToggle, onReset, prayerTimes }) {
  const hasAnyCompleted = Object.values(prayers).some(Boolean)

  return (
    <div>
      <div className="flex flex-col gap-3">
        {PRAYERS.map((name) => (
          <PrayerItem
            key={name}
            name={name}
            completed={prayers[name]}
            onToggle={() => onToggle(name)}
            time={prayerTimes ? formatTime(prayerTimes[name]) : undefined}
          />
        ))}
      </div>

      {/* Reset button — only visible when at least one prayer is checked */}
      {hasAnyCompleted && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={onReset}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-400 transition-colors hover:text-red-500 hover:bg-red-50 dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-950"
          >
            Reset Today
          </button>
        </div>
      )}
    </div>
  )
}
