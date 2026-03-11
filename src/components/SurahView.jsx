import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronRight,
  Play,
  Pause,
  Repeat,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react'
import surahs from '../data/surahs'

const BOOKMARKS_KEY = 'quran-bookmarks'

function loadBookmarks() {
  try {
    return JSON.parse(localStorage.getItem(BOOKMARKS_KEY)) || []
  } catch {
    return []
  }
}

function saveBookmarks(bookmarks) {
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks))
  } catch { /* ignore */ }
}

export default function SurahView({ surahNumber, scrollToAyah, onBack, onUpdateLastRead }) {
  const surah = surahs.find((s) => s.number === surahNumber)

  const [ayahs, setAyahs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [playingAyah, setPlayingAyah] = useState(null)
  const [continuousPlay, setContinuousPlay] = useState(false)
  const [bookmarks, setBookmarks] = useState(loadBookmarks)

  const cacheRef = useRef({})
  const audioRef = useRef(null)
  const audioMapRef = useRef({})
  const ayahRefs = useRef({})
  const continuousRef = useRef(false)
  const lastReportedRef = useRef(null)

  // Keep continuousRef in sync
  useEffect(() => {
    continuousRef.current = continuousPlay
  })

  // Fetch surah text
  useEffect(() => {
    let cancelled = false

    async function fetchSurah() {
      if (cacheRef.current[surahNumber]) {
        setAyahs(cacheRef.current[surahNumber])
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const res = await fetch(
          `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,en.sahih`
        )
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        const json = await res.json()

        const arabicAyahs = json.data[0].ayahs
        const englishAyahs = json.data[1].ayahs

        const merged = arabicAyahs.map((a, i) => ({
          number: a.numberInSurah,
          arabic: a.text,
          translation: englishAyahs[i].text,
        }))

        if (!cancelled) {
          cacheRef.current[surahNumber] = merged
          setAyahs(merged)
        }
      } catch {
        if (!cancelled) setError('Could not load surah. Please check your connection.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchSurah()
    return () => { cancelled = true }
  }, [surahNumber])

  // Scroll to ayah after loading
  useEffect(() => {
    if (scrollToAyah && !loading && ayahRefs.current[scrollToAyah]) {
      setTimeout(() => {
        ayahRefs.current[scrollToAyah]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    }
  }, [scrollToAyah, loading])

  // Last-read tracking via IntersectionObserver
  useEffect(() => {
    if (loading || ayahs.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const ayahNum = Number(entry.target.dataset.ayah)
            if (ayahNum && ayahNum !== lastReportedRef.current) {
              lastReportedRef.current = ayahNum
              onUpdateLastRead(surahNumber, ayahNum)
            }
          }
        })
      },
      { threshold: 0.5 }
    )

    Object.values(ayahRefs.current).forEach((el) => {
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [loading, ayahs, surahNumber, onUpdateLastRead])

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Fetch audio URLs lazily
  const fetchAudioMap = useCallback(async () => {
    if (audioMapRef.current[surahNumber]) return audioMapRef.current[surahNumber]

    try {
      const res = await fetch(
        `https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`
      )
      if (!res.ok) throw new Error('Audio fetch failed')
      const json = await res.json()

      const map = {}
      json.data.ayahs.forEach((a) => {
        map[a.numberInSurah] = a.audio
      })
      audioMapRef.current[surahNumber] = map
      return map
    } catch {
      return null
    }
  }, [surahNumber])

  const playAyah = useCallback(async (ayahNum) => {
    const map = await fetchAudioMap()
    if (!map || !map[ayahNum]) return

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.onended = null
    }

    const audio = new Audio(map[ayahNum])
    audioRef.current = audio

    audio.onended = () => {
      if (continuousRef.current) {
        const nextAyah = ayahNum + 1
        if (map[nextAyah]) {
          playAyah(nextAyah)
        } else {
          setPlayingAyah(null)
        }
      } else {
        setPlayingAyah(null)
      }
    }

    audio.onerror = () => setPlayingAyah(null)

    try {
      await audio.play()
      setPlayingAyah(ayahNum)
    } catch {
      setPlayingAyah(null)
    }
  }, [fetchAudioMap])

  const togglePlay = useCallback((ayahNum) => {
    if (playingAyah === ayahNum) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.onended = null
      }
      setPlayingAyah(null)
    } else {
      playAyah(ayahNum)
    }
  }, [playingAyah, playAyah])

  const isBookmarked = useCallback((ayahNum) => {
    return bookmarks.some((b) => b.surah === surahNumber && b.ayah === ayahNum)
  }, [bookmarks, surahNumber])

  const toggleBookmark = useCallback((ayahNum) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.surah === surahNumber && b.ayah === ayahNum)
      const updated = exists
        ? prev.filter((b) => !(b.surah === surahNumber && b.ayah === ayahNum))
        : [...prev, { surah: surahNumber, ayah: ayahNum, timestamp: Date.now() }]
      saveBookmarks(updated)
      return updated
    })
  }, [surahNumber])

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-20">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        <span className="text-sm text-zinc-400 dark:text-zinc-500">Loading surah…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm font-medium text-emerald-600 transition hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          <ChevronRight size={16} className="rotate-180" strokeWidth={2} />
          Back
        </button>
        <div className="flex flex-col items-center gap-3 py-16">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{error}</p>
          <button
            onClick={() => {
              setError(null)
              setLoading(true)
              delete cacheRef.current[surahNumber]
              // Re-trigger fetch by forcing re-render
              setAyahs([])
            }}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.pause()
              audioRef.current.onended = null
            }
            setPlayingAyah(null)
            onBack()
          }}
          className="flex items-center gap-1 text-sm font-medium text-emerald-600 transition hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          <ChevronRight size={16} className="rotate-180" strokeWidth={2} />
          Back
        </button>

        {/* Continuous play toggle */}
        <button
          onClick={() => setContinuousPlay((p) => !p)}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
            continuousPlay
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300'
          }`}
        >
          <Repeat size={13} strokeWidth={2} />
          Auto-play
        </button>
      </div>

      {/* Surah title card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-2xl border border-zinc-200 bg-white p-5 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <p dir="rtl" className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {surah?.name}
        </p>
        <p className="mt-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {surah?.englishName}
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          {surah?.englishNameTranslation} · {surah?.ayahCount} ayahs · {surah?.revelationType}
        </p>

        {/* Bismillah (all surahs except At-Tawba) */}
        {surahNumber !== 9 && (
          <p dir="rtl" className="mt-4 text-lg text-zinc-600 dark:text-zinc-300">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </p>
        )}
      </motion.div>

      {/* Ayahs */}
      <div className="space-y-3">
        {ayahs.map((ayah, i) => {
          const isPlaying = playingAyah === ayah.number
          const bookmarked = isBookmarked(ayah.number)

          return (
            <motion.div
              key={ayah.number}
              ref={(el) => { ayahRefs.current[ayah.number] = el }}
              data-ayah={ayah.number}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: Math.min(i * 0.015, 0.3) }}
              className={`rounded-2xl border bg-white p-5 shadow-sm transition-colors dark:bg-zinc-900 ${
                isPlaying
                  ? 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-700/50 dark:bg-emerald-950/20'
                  : 'border-zinc-200 dark:border-zinc-800'
              }`}
            >
              {/* Ayah number + actions */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
                  <span className="text-[10px] font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {ayah.number}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => togglePlay(ayah.number)}
                    className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                      isPlaying
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-800/40 dark:text-emerald-400'
                        : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300'
                    }`}
                  >
                    {isPlaying ? <Pause size={13} strokeWidth={2} /> : <Play size={13} strokeWidth={2} />}
                  </button>

                  <button
                    onClick={() => toggleBookmark(ayah.number)}
                    className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                      bookmarked
                        ? 'text-amber-500 dark:text-amber-400'
                        : 'text-zinc-300 hover:text-zinc-500 dark:text-zinc-600 dark:hover:text-zinc-400'
                    }`}
                  >
                    {bookmarked ? (
                      <BookmarkCheck size={14} strokeWidth={1.5} />
                    ) : (
                      <Bookmark size={14} strokeWidth={1.5} />
                    )}
                  </button>
                </div>
              </div>

              {/* Arabic */}
              <p
                dir="rtl"
                className="text-xl leading-[2] font-semibold text-zinc-900 dark:text-zinc-100"
              >
                {ayah.arabic}
              </p>

              {/* Translation */}
              <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                {ayah.translation}
              </p>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
