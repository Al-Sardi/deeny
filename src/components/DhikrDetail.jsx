import { motion } from 'framer-motion'
import { Play } from 'lucide-react'

export default function DhikrDetail({ dhikr, onStartTasbih }) {
  return (
    <div className="space-y-6">
      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="flex flex-col items-center gap-5">
          {/* Arabic text */}
          <p className="text-3xl leading-relaxed font-semibold text-zinc-900 dark:text-zinc-100" dir="rtl">
            {dhikr.arabic}
          </p>

          {/* Divider */}
          <div className="h-px w-12 bg-zinc-200 dark:bg-zinc-700" />

          {/* Transliteration */}
          <p className="text-base font-medium text-zinc-600 dark:text-zinc-300">
            {dhikr.transliteration}
          </p>

          {/* Meaning */}
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {dhikr.meaning}
          </p>
        </div>
      </motion.div>

      {/* Start Tasbih button */}
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.08 }}
        onClick={() => onStartTasbih(dhikr)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98]"
      >
        <Play size={16} strokeWidth={2.5} fill="currentColor" />
        Start Tasbih
      </motion.button>
    </div>
  )
}
