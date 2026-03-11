import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Search, ChevronRight } from 'lucide-react'

export default function QuranSearch({ onNavigate }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    clearTimeout(timerRef.current)

    if (!query.trim() || query.trim().length < 3) {
      setResults([])
      setSearched(false)
      setLoading(false)
      return
    }

    setLoading(true)

    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.alquran.cloud/v1/search/${encodeURIComponent(query.trim())}/all/en.sahih`
        )

        if (!res.ok) {
          setResults([])
          setSearched(true)
          setLoading(false)
          return
        }

        const json = await res.json()

        if (json.data?.matches) {
          setResults(json.data.matches)
        } else {
          setResults([])
        }
        setSearched(true)
      } catch {
        setResults([])
        setSearched(true)
      } finally {
        setLoading(false)
      }
    }, 600)

    return () => clearTimeout(timerRef.current)
  }, [query])

  // Group results by surah
  const grouped = results.reduce((acc, match) => {
    const key = match.surah.number
    if (!acc[key]) {
      acc[key] = {
        surah: match.surah,
        matches: [],
      }
    }
    acc[key].matches.push(match)
    return acc
  }, {})

  const groups = Object.values(grouped)

  return (
    <div className="space-y-4">
      {/* Search input */}
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
          placeholder="Search the Quran (min. 3 characters)…"
          className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-emerald-500"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        </div>
      )}

      {/* Results */}
      {!loading && searched && groups.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            {results.length} {results.length === 1 ? 'result' : 'results'}
          </p>

          {groups.map((group, gi) => (
            <motion.div
              key={group.surah.number}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: Math.min(gi * 0.04, 0.3) }}
            >
              {/* Surah header */}
              <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {group.surah.number}. {group.surah.englishName}{' '}
                <span className="text-zinc-400 dark:text-zinc-500">
                  ({group.matches.length})
                </span>
              </p>

              {/* Matches */}
              <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                {group.matches.map((match, mi) => (
                  <button
                    key={`${match.surah.number}-${match.numberInSurah}`}
                    onClick={() => onNavigate(match.surah.number, match.numberInSurah)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-zinc-50 active:bg-zinc-100 dark:hover:bg-zinc-800/50 dark:active:bg-zinc-800 ${
                      mi < group.matches.length - 1
                        ? 'border-b border-zinc-100 dark:border-zinc-800'
                        : ''
                    }`}
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800">
                      <span className="text-[10px] font-medium tabular-nums text-zinc-500 dark:text-zinc-400">
                        {match.numberInSurah}
                      </span>
                    </div>
                    <p className="min-w-0 flex-1 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 line-clamp-2">
                      {match.text}
                    </p>
                    <ChevronRight size={14} className="shrink-0 text-zinc-300 dark:text-zinc-600" strokeWidth={1.5} />
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* No results */}
      {!loading && searched && groups.length === 0 && (
        <p className="py-12 text-center text-sm text-zinc-400 dark:text-zinc-500">
          No results found
        </p>
      )}

      {/* Initial state */}
      {!loading && !searched && (
        <p className="py-12 text-center text-sm text-zinc-400 dark:text-zinc-500">
          Search the Quran by English translation
        </p>
      )}
    </div>
  )
}
