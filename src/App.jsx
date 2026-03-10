import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from './context/AuthContext'
import Header from './components/Header'
import PrayerList from './components/PrayerList'
import ProgressBar from './components/ProgressBar'
import WeeklyStats from './components/WeeklyStats'
import DailyAyah from './components/DailyAyah'
import StreaksTab from './components/StreaksTab'
import CalendarTab from './components/CalendarTab'
import SettingsTab from './components/SettingsTab'
import ToolsTab from './components/ToolsTab'
import BottomNav from './components/BottomNav'
import usePrayerTimes from './hooks/usePrayerTimes'
import {
  fetchTodayPrayers,
  fetchYesterdayPrayers,
  fetchPrayerHistory,
  upsertTodayPrayers,
  bulkInsertHistory,
  rowToPrayers,
  rowsToHistory,
} from './lib/supabasePrayers'

const THEME_KEY = 'prayer-theme'
const TOTAL_PRAYERS = 5

const defaultPrayers = () => ({
  Fajr: false,
  Dhuhr: false,
  Asr: false,
  Maghrib: false,
  Isha: false,
})

const getToday = () => new Date().toISOString().split('T')[0]

const getYesterday = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

const tabVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.12 } },
}

export default function App() {
  const { user } = useAuth()

  const [prayers, setPrayers] = useState(defaultPrayers())
  const [streak, setStreak] = useState(0)
  const [history, setHistory] = useState([])
  const [dataLoading, setDataLoading] = useState(true)

  const [dark, setDark] = useState(() => localStorage.getItem(THEME_KEY) === 'dark')
  const [activeTab, setActiveTab] = useState('prayers')

  const { prayerTimes, nextPrayer, nextPrayerTime, loading, error } = usePrayerTimes()

  const saveTimerRef = useRef(null)
  const latestRef = useRef({ prayers: defaultPrayers(), streak: 0 })
  const dirtyRef = useRef(false)

  // Always keep latestRef in sync so flush has current values
  useEffect(() => {
    latestRef.current = { prayers, streak }
  })

  // Flush pending save on page close / app switch
  useEffect(() => {
    function flush() {
      if (dirtyRef.current) {
        const { prayers: p, streak: s } = latestRef.current
        // navigator.sendBeacon isn't available for Supabase, so fire-and-forget
        upsertTodayPrayers(user.id, getToday(), p, s).catch(() => {})
        dirtyRef.current = false
      }
    }

    window.addEventListener('beforeunload', flush)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush()
    })

    return () => {
      window.removeEventListener('beforeunload', flush)
      flush() // also flush on unmount
    }
  }, [user.id])

  useEffect(() => {
    let cancelled = false

    async function loadFromSupabase() {
      const today = getToday()
      const yesterday = getYesterday()

      try {
        const [todayRes, yesterdayRes, historyRes] = await Promise.all([
          fetchTodayPrayers(user.id, today),
          fetchYesterdayPrayers(user.id, yesterday),
          fetchPrayerHistory(user.id, today),
        ])

        if (cancelled) return

        if (todayRes.error || historyRes.error) {
          console.error('Supabase load error:', todayRes.error || historyRes.error)
          setDataLoading(false)
          return
        }

        const historyData = rowsToHistory(historyRes.data ?? [])

        if (todayRes.data) {
          setPrayers(rowToPrayers(todayRes.data))
          setStreak(todayRes.data.streak)
        } else {
          const yRow = yesterdayRes.data
          if (yRow) {
            const allDone = [yRow.fajr, yRow.dhuhr, yRow.asr, yRow.maghrib, yRow.isha].every(Boolean)
            setStreak(allDone ? (yRow.streak ?? 0) + 1 : 0)
          } else {
            setStreak(0)
          }
        }

        setHistory(historyData)
      } catch (err) {
        console.error('Failed to load prayer data:', err)
      } finally {
        if (!cancelled) setDataLoading(false)
      }
    }

    loadFromSupabase()
    return () => { cancelled = true }
  }, [user.id])

  useEffect(() => {
    if (dataLoading) return

    async function migrate() {
      try {
        const raw = localStorage.getItem('prayer-tracker')
        if (!raw) return
        const saved = JSON.parse(raw)
        if (!saved) return
        if (history.length > 0) return

        if (saved.history?.length > 0) await bulkInsertHistory(user.id, saved.history)
        if (saved.date === getToday() && saved.prayers) {
          await upsertTodayPrayers(user.id, getToday(), saved.prayers, saved.streak ?? 0)
          setPrayers(saved.prayers)
          setStreak(saved.streak ?? 0)
        }

        const { data } = await fetchPrayerHistory(user.id, getToday())
        if (data) setHistory(rowsToHistory(data))
        localStorage.removeItem('prayer-tracker')
      } catch (err) {
        console.error('localStorage migration failed:', err)
      }
    }

    migrate()
  }, [dataLoading, history.length, user.id])

  useEffect(() => {
    if (dataLoading) return

    dirtyRef.current = true
    clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      upsertTodayPrayers(user.id, getToday(), prayers, streak)
        .then(({ error }) => {
          if (error) console.error('Failed to save prayers:', error)
          else dirtyRef.current = false
        })
    }, 500)

    return () => clearTimeout(saveTimerRef.current)
  }, [prayers, streak, user.id, dataLoading])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light')
  }, [dark])

  const togglePrayer = (name) => setPrayers((prev) => ({ ...prev, [name]: !prev[name] }))
  const resetToday = () => setPrayers(defaultPrayers())
  const completedCount = Object.values(prayers).filter(Boolean).length

  if (dataLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <span className="text-sm text-zinc-400 dark:text-zinc-500">Loading…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh items-start justify-center bg-zinc-50 px-5 pt-14 pb-28 transition-colors dark:bg-zinc-950">
      <div className="w-full max-w-md">
        <Header
          streak={activeTab === 'prayers' ? streak : undefined}
          nextPrayer={activeTab === 'prayers' ? nextPrayer : undefined}
          nextPrayerTime={activeTab === 'prayers' ? nextPrayerTime : undefined}
          loading={activeTab === 'prayers' ? loading : false}
          error={activeTab === 'prayers' ? error : null}
        />

        <AnimatePresence mode="wait">
          {activeTab === 'prayers' && (
            <motion.div key="prayers" variants={tabVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
              <DailyAyah />
              <PrayerList
                prayers={prayers}
                onToggle={togglePrayer}
                onReset={resetToday}
                prayerTimes={prayerTimes}
              />
              <ProgressBar completed={completedCount} total={TOTAL_PRAYERS} />
            </motion.div>
          )}

          {activeTab === 'streaks' && (
            <motion.div key="streaks" variants={tabVariants} initial="initial" animate="animate" exit="exit">
              <StreaksTab prayers={prayers} streak={streak} history={history} />
            </motion.div>
          )}

          {activeTab === 'calendar' && (
            <motion.div key="calendar" variants={tabVariants} initial="initial" animate="animate" exit="exit">
              <CalendarTab prayers={prayers} history={history}>
                <WeeklyStats prayers={prayers} history={history} />
              </CalendarTab>
            </motion.div>
          )}

          {activeTab === 'tools' && (
            <motion.div key="tools" variants={tabVariants} initial="initial" animate="animate" exit="exit">
              <ToolsTab />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div key="settings" variants={tabVariants} initial="initial" animate="animate" exit="exit">
              <SettingsTab dark={dark} onToggleTheme={() => setDark((d) => !d)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
    </div>
  )
}
