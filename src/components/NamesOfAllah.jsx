import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import namesOfAllah from '../data/namesOfAllah'

export default function NamesOfAllah() {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return namesOfAllah
    const q = query.toLowerCase()
    return namesOfAllah.filter(
      (n) =>
        n.transliteration.toLowerCase().includes(q) ||
        n.meaning.toLowerCase().includes(q) ||
        n.arabic.includes(query)
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
          placeholder="Search by name or meaning…"
          className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-emerald-500"
        />
      </div>

      {/* Count */}
      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        {filtered.length} {filtered.length === 1 ? 'name' : 'names'}
      </p>

      {/* Names list */}
      <div className="space-y-2">
        {filtered.map((name, i) => (
          <motion.div
            key={name.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.4) }}
            className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white px-5 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            {/* Number */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
              <span className="text-xs font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                {name.id}
              </span>
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {name.transliteration}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {name.meaning}
              </p>
            </div>

            {/* Arabic */}
            <p
              dir="rtl"
              className="shrink-0 text-xl font-semibold text-zinc-800 dark:text-zinc-200"
            >
              {name.arabic}
            </p>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-zinc-400 dark:text-zinc-500">
            No names found
          </p>
        )}
      </div>
    </div>
  )
}
