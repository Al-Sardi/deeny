import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, BookOpen, ChevronRight } from 'lucide-react'
import surahs from '../data/surahs'

export default function SurahList({ onSelectSurah, lastRead, onResumeLastRead }) {
  const [query, setQuery] = useState('')

  const lastReadSurah = useMemo(() => {
    if (!lastRead) return null
    return surahs.find((s) => s.number === lastRead.surah)
  }, [lastRead])

  const filtered = useMemo(() => {
    if (!query.trim()) return surahs
    const q = query.toLowerCase()
    return surahs.filter(
      (s) =>
        s.englishName.toLowerCase().includes(q) ||
        s.englishNameTranslation.toLowerCase().includes(q) ||
        s.name.includes(query) ||
        String(s.number) === q.trim()
    )
  }, [query])

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
          strokeWidth={1.5}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search surahs…"
          className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-emerald-500"
        />
      </div>

      {/* Last read card */}
      {lastReadSurah && !query.trim() && (
        <motion.button
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onResumeLastRead}
          className="flex w-full items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm transition active:scale-[0.98] dark:border-emerald-800/50 dark:bg-emerald-900/20"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-800/40">
            <BookOpen size={18} className="text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
          </div>
          <div className="flex-1 text-left">
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Continue reading</p>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {lastReadSurah.englishName}{' '}
              <span className="font-normal text-zinc-500 dark:text-zinc-400">
                · Ayah {lastRead.ayah}
              </span>
            </p>
          </div>
          <ChevronRight size={16} className="text-emerald-400 dark:text-emerald-500" strokeWidth={1.5} />
        </motion.button>
      )}

      {/* Count */}
      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        {filtered.length} {filtered.length === 1 ? 'surah' : 'surahs'}
      </p>

      {/* Surah list */}
      <div className="space-y-2">
        {filtered.map((s, i) => (
          <motion.button
            key={s.number}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.4) }}
            onClick={() => onSelectSurah(s.number)}
            className="flex w-full items-center gap-4 rounded-2xl border border-zinc-200 bg-white px-5 py-4 shadow-sm transition hover:border-zinc-300 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
          >
            {/* Number badge */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
              <span className="text-xs font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                {s.number}
              </span>
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1 text-left">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {s.englishName}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {s.englishNameTranslation} · {s.ayahCount} ayahs
              </p>
            </div>

            {/* Arabic name + type */}
            <div className="shrink-0 text-right">
              <p dir="rtl" className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                {s.name}
              </p>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                {s.revelationType}
              </p>
            </div>
          </motion.button>
        ))}

        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-zinc-400 dark:text-zinc-500">
            No surahs found
          </p>
        )}
      </div>
    </div>
  )
}
