import { motion } from 'framer-motion'
import PrayerItem from './PrayerItem'

const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']

function formatTime(timeStr) {
  if (!timeStr) return undefined
  const [h, m] = timeStr.split(':').map(Number)
  return `${h}:${String(m).padStart(2, '0')}`
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

export default function PrayerList({ prayers, onToggle, onReset, prayerTimes }) {
  const hasAnyCompleted = Object.values(prayers).some(Boolean)

  return (
    <div>
      <motion.div
        className="space-y-2.5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {PRAYERS.map((name) => (
          <motion.div key={name} variants={itemVariants}>
            <PrayerItem
              name={name}
              completed={prayers[name]}
              onToggle={() => onToggle(name)}
              time={prayerTimes ? formatTime(prayerTimes[name]) : undefined}
            />
          </motion.div>
        ))}
      </motion.div>

      {hasAnyCompleted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 flex justify-center"
        >
          <button
            onClick={onReset}
            className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            Reset today
          </button>
        </motion.div>
      )}
    </div>
  )
}
