import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { List, Search } from 'lucide-react'
import SurahList from './SurahList'
import SurahView from './SurahView'
import QuranSearch from './QuranSearch'

export default function QuranReader({ onBack }) {
  const [view, setView] = useState('list') // 'list' | 'surah' | 'search'
  const [selectedSurah, setSelectedSurah] = useState(null)
  const [scrollToAyah, setScrollToAyah] = useState(null)

  const [lastRead, setLastRead] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('quran-last-read'))
    } catch {
      return null
    }
  })

  const handleSelectSurah = useCallback((number) => {
    setSelectedSurah(number)
    setScrollToAyah(null)
    setView('surah')
  }, [])

  const handleNavigateToAyah = useCallback((surah, ayah) => {
    setSelectedSurah(surah)
    setScrollToAyah(ayah)
    setView('surah')
  }, [])

  const handleBackToList = useCallback(() => {
    setView('list')
    setSelectedSurah(null)
    setScrollToAyah(null)
  }, [])

  const handleUpdateLastRead = useCallback((surah, ayah) => {
    const data = { surah, ayah }
    setLastRead(data)
    try {
      localStorage.setItem('quran-last-read', JSON.stringify(data))
    } catch { /* ignore */ }
  }, [])

  const handleResumeLastRead = useCallback(() => {
    if (lastRead) {
      handleNavigateToAyah(lastRead.surah, lastRead.ayah)
    }
  }, [lastRead, handleNavigateToAyah])

  if (view === 'surah' && selectedSurah) {
    return (
      <SurahView
        surahNumber={selectedSurah}
        scrollToAyah={scrollToAyah}
        onBack={handleBackToList}
        onUpdateLastRead={handleUpdateLastRead}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Quran
        </h2>

        <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
          <button
            onClick={() => setView('list')}
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
              view !== 'search'
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300'
            }`}
          >
            <List size={15} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setView('search')}
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
              view === 'search'
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300'
            }`}
          >
            <Search size={15} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Content */}
      <motion.div
        key={view}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {view === 'search' ? (
          <QuranSearch onNavigate={handleNavigateToAyah} />
        ) : (
          <SurahList
            onSelectSurah={handleSelectSurah}
            lastRead={lastRead}
            onResumeLastRead={handleResumeLastRead}
          />
        )}
      </motion.div>
    </div>
  )
}
