import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import dhikrList from '../data/dhikr'
import DhikrDetail from './DhikrDetail'
import TasbihCounter from './TasbihCounter'

export default function DhikrLibrary({ onBack }) {
  const [selected, setSelected] = useState(null)
  const [tasbihDhikr, setTasbihDhikr] = useState(null)

  // Tasbih view for a specific dhikr
  if (tasbihDhikr) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setTasbihDhikr(null)}
          className="flex items-center gap-1 text-sm font-medium text-emerald-600 transition hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          <ChevronRight size={16} className="rotate-180" strokeWidth={2} />
          Back to {tasbihDhikr.transliteration}
        </button>

        {/* Dhikr label */}
        <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-center text-lg font-semibold text-zinc-900 dark:text-zinc-100" dir="rtl">
            {tasbihDhikr.arabic}
          </p>
          <p className="mt-1 text-center text-xs text-zinc-500 dark:text-zinc-400">
            {tasbihDhikr.transliteration}
          </p>
        </div>

        <TasbihCounter initialTarget={tasbihDhikr.target} />
      </div>
    )
  }

  // Detail view for a selected dhikr
  if (selected) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-1 text-sm font-medium text-emerald-600 transition hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          <ChevronRight size={16} className="rotate-180" strokeWidth={2} />
          Back to Dhikr Library
        </button>
        <DhikrDetail dhikr={selected} onStartTasbih={setTasbihDhikr} />
      </div>
    )
  }

  // List view
  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm font-medium text-emerald-600 transition hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
      >
        <ChevronRight size={16} className="rotate-180" strokeWidth={2} />
        Back to Tools
      </button>

      <div className="space-y-2.5">
        {dhikrList.map((item, i) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
            onClick={() => setSelected(item)}
            className="flex w-full items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
          >
            <div className="flex-1 text-left">
              <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100" dir="rtl">
                {item.arabic}
              </p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {item.transliteration} · {item.meaning}
              </p>
            </div>
            <ChevronRight size={18} className="shrink-0 text-zinc-300 dark:text-zinc-600" strokeWidth={1.5} />
          </motion.button>
        ))}
      </div>
    </div>
  )
}
