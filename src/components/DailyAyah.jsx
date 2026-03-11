import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const AYAH_KEY = 'daily-ayah'
const API_URL = 'https://api.alquran.cloud/v1/ayah/random/en.asad'

function getToday() {
  return new Date().toISOString().split('T')[0]
}

function loadCachedAyah() {
  try {
    const cached = JSON.parse(localStorage.getItem(AYAH_KEY))
    if (cached && cached.date === getToday()) return cached.ayah
  } catch { /* ignore */ }
  return null
}

function cacheAyah(ayah) {
  localStorage.setItem(AYAH_KEY, JSON.stringify({ date: getToday(), ayah }))
}

export default function DailyAyah() {
  const { t } = useTranslation()
  const [ayah, setAyah] = useState(loadCachedAyah)
  const [loading, setLoading] = useState(() => loadCachedAyah() === null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (ayah) return
    let cancelled = false

    async function fetchAyah() {
      try {
        const res = await fetch(API_URL)
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        const json = await res.json()
        const data = json.data
        const result = {
          text: data.text,
          surahName: data.surah.englishName,
          surahNumber: data.surah.number,
          ayahNumber: data.numberInSurah,
        }
        if (!cancelled) {
          cacheAyah(result)
          setAyah(result)
        }
      } catch {
        if (!cancelled) setError(t('daily_ayah.error'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchAyah()
    return () => { cancelled = true }
  }, [ayah, t])

  const card = 'mb-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900'

  if (loading) {
    return (
      <div className={card}>
        <div className="flex items-center justify-center gap-2">
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-zinc-300 border-t-transparent dark:border-zinc-600" />
          <span className="text-sm text-zinc-400 dark:text-zinc-500">{t('daily_ayah.loading')}</span>
        </div>
      </div>
    )
  }

  if (error || !ayah) {
    return (
      <div className={card}>
        <p className="text-center text-sm text-zinc-400 dark:text-zinc-500">{error ?? t('daily_ayah.unavailable')}</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={card}
    >
      <div className="flex items-start gap-3">
        <BookOpen size={16} className="mt-0.5 shrink-0 text-emerald-500" strokeWidth={1.5} />
        <div className="min-w-0">
          <p className="text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">
            &ldquo;{ayah.text}&rdquo;
          </p>
          <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
            {ayah.surahName} {ayah.surahNumber}:{ayah.ayahNumber}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
