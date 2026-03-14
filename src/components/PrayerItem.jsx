import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

export default function PrayerItem({ name, completed, onToggle, time }) {
  const handleToggle = () => {
    if (navigator.vibrate) navigator.vibrate(30)
    onToggle()
  }

  return (
    <motion.button
      onClick={handleToggle}
      whileTap={{ scale: 0.98 }}
      className={`flex w-full items-center justify-between rounded-2xl border px-5 py-4
        transition-colors duration-200
        ${completed
          ? 'border-emerald-200 bg-emerald-50/80 dark:border-emerald-900/60 dark:bg-emerald-950/30'
          : 'border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/70'
        }`}
    >
      <div className="flex items-center gap-3.5">
        {/* Checkbox circle */}
        <div
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors duration-200
            ${completed
              ? 'border-emerald-500 bg-emerald-500 dark:border-emerald-500 dark:bg-emerald-500'
              : 'border-zinc-300 dark:border-zinc-600'
            }`}
        >
          {completed && <Check size={14} strokeWidth={2.5} className="text-white" />}
        </div>

        <span className={`text-base font-medium transition-colors duration-200
          ${completed
            ? 'text-emerald-800 dark:text-emerald-300'
            : 'text-zinc-900 dark:text-zinc-100'
          }`}
        >
          {name}
        </span>
      </div>

      {time && (
        <span className="text-sm text-zinc-400 dark:text-zinc-500 tabular-nums">
          {time}
        </span>
      )}
    </motion.button>
  )
}
