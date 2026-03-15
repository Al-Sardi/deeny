import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Sparkles, Copy, Check, BookOpen, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { generateDua } from '../lib/supabaseDua'

const SUGGESTION_KEYS = [
  'exam', 'travel', 'illness', 'gratitude',
  'protection', 'forgiveness', 'guidance', 'anxiety',
]

const HISTORY_KEY = 'deeny_dua_history'

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  } catch {
    return []
  }
}

function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 10)))
}

export default function DuaGenerator() {
  const { t, i18n } = useTranslation()
  const [topic, setTopic] = useState('')
  const [duas, setDuas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copiedIdx, setCopiedIdx] = useState(null)
  const [history, setHistory] = useState(loadHistory)

  const handleGenerate = async (searchTopic) => {
    const q = (searchTopic || topic).trim()
    if (!q || loading) return

    setLoading(true)
    setError(null)
    setDuas([])

    try {
      const result = await generateDua(q, i18n.language)
      setDuas(result)

      // Save to history
      const entry = { topic: q, duas: result, date: new Date().toISOString() }
      const updated = [entry, ...history.filter((h) => h.topic !== q)].slice(0, 10)
      setHistory(updated)
      saveHistory(updated)
    } catch (err) {
      setError(err.message || t('dua.error'))
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestion = (key) => {
    const label = t(`dua.suggestions.${key}`)
    setTopic(label)
    handleGenerate(label)
  }

  const handleCopy = async (dua, idx) => {
    const text = `${dua.arabic}\n\n${dua.transliteration}\n\n${dua.translation}\n\n— ${dua.source}`
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 2000)
    } catch {}
  }

  const handleHistoryItem = (entry) => {
    setTopic(entry.topic)
    setDuas(entry.duas)
    setError(null)
  }

  return (
    <div className="space-y-5 pb-4">
      {/* Search input */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
          strokeWidth={2}
        />
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          placeholder={t('dua.placeholder')}
          className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-emerald-500"
        />
      </div>

      {/* Generate button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => handleGenerate()}
        disabled={!topic.trim() || loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Sparkles size={16} strokeWidth={2} />
        {loading ? t('dua.loading') : t('dua.generate')}
      </motion.button>

      {/* Suggestion chips */}
      {duas.length === 0 && !loading && (
        <div className="flex flex-wrap gap-2">
          {SUGGESTION_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => handleSuggestion(key)}
              className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-emerald-600 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400"
            >
              {t(`dua.suggestions.${key}`)}
            </button>
          ))}
        </div>
      )}

      {/* Loading skeleton */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {[1, 2].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="h-8 w-3/4 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
                  <div className="h-px w-12 bg-zinc-200 dark:bg-zinc-700" />
                  <div className="h-4 w-2/3 rounded bg-zinc-200 dark:bg-zinc-700" />
                  <div className="h-4 w-full rounded bg-zinc-100 dark:bg-zinc-800" />
                  <div className="h-3 w-1/3 rounded bg-zinc-100 dark:bg-zinc-800" />
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
        >
          <AlertCircle size={18} strokeWidth={2} />
          {error}
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {duas.length > 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {duas.map((dua, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex flex-col items-center gap-4">
                  {/* Arabic */}
                  <p
                    className="text-center text-2xl leading-loose font-semibold text-zinc-900 dark:text-zinc-100"
                    dir="rtl"
                  >
                    {dua.arabic}
                  </p>

                  {/* Divider */}
                  <div className="h-px w-12 bg-zinc-200 dark:bg-zinc-700" />

                  {/* Transliteration */}
                  <p className="text-center text-sm font-medium italic text-zinc-600 dark:text-zinc-300">
                    {dua.transliteration}
                  </p>

                  {/* Translation */}
                  <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                    {dua.translation}
                  </p>

                  {/* Source badge */}
                  <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 dark:bg-emerald-900/20">
                    <BookOpen size={12} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                      {dua.source}
                    </span>
                  </div>

                  {/* Context */}
                  {dua.context && (
                    <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
                      {dua.context}
                    </p>
                  )}

                  {/* Copy button */}
                  <button
                    onClick={() => handleCopy(dua, idx)}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-500 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    {copiedIdx === idx ? (
                      <>
                        <Check size={13} className="text-emerald-500" />
                        {t('dua.copied')}
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        {t('dua.copy')}
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}

            {/* Disclaimer */}
            <p className="text-center text-[10px] text-zinc-400 dark:text-zinc-500">
              {t('dua.powered_by')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History (shown when no results and not loading) */}
      {duas.length === 0 && !loading && history.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            {t('dua.recent')}
          </p>
          {history.map((entry, idx) => (
            <button
              key={idx}
              onClick={() => handleHistoryItem(entry)}
              className="flex w-full items-center gap-3 rounded-xl border border-zinc-100 bg-white px-4 py-3 text-left transition hover:border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
            >
              <Sparkles size={14} className="shrink-0 text-emerald-500" />
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {entry.topic}
              </span>
              <span className="ml-auto text-[10px] text-zinc-400">
                {entry.duas.length} duas
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
