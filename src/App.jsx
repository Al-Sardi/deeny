import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from './context/AuthContext'
import Header from './components/Header'
import PrayerList from './components/PrayerList'
import ProgressBar from './components/ProgressBar'
import DailyAyah from './components/DailyAyah'
import ProgressTab from './components/ProgressTab'
import SettingsTab from './components/SettingsTab'
import QuickTools from './components/QuickTools'
import QuranReader from './components/QuranReader'
import BottomNav from './components/BottomNav'
import CelebrationModal from './components/CelebrationModal'
import usePrayerTimes from './hooks/usePrayerTimes'
import useNotifications from './hooks/useNotifications'
import {
  fetchTodayPrayers,
  fetchYesterdayPrayers,
  fetchPrayerHistory,
  upsertTodayPrayers,
  flushSave,
  bulkInsertHistory,
  rowToPrayers,
  rowsToHistory,
} from './lib/supabasePrayers'
import { supabase } from './lib/supabase'
import { getToday, getYesterday } from './lib/dateUtils'

const THEME_KEY = 'prayer-theme'
const FREEZE_KEY = 'streak-freezes'
const FREEZE_USED_KEY = 'streak-freeze-last-used'
const TOTAL_PRAYERS = 5

function getStreakFreezes() {
  return parseInt(localStorage.getItem(FREEZE_KEY) ?? '2', 10)
}
function setStreakFreezes(n) {
  localStorage.setItem(FREEZE_KEY, String(Math.max(0, n)))
}
function getLastFreezeUsed() {
  return localStorage.getItem(FREEZE_USED_KEY) || ''
}
function setLastFreezeUsed(date) {
  localStorage.setItem(FREEZE_USED_KEY, date)
}

const defaultPrayers = () => ({
  Fajr: false,
  Dhuhr: false,
  Asr: false,
  Maghrib: false,
  Isha: false,
})

const tabVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.12 } },
}

export default function App() {
  const { user } = useAuth()

  const [prayers, setPrayers] = useState(defaultPrayers())
  const [streak, setStreak] = useState(0)
  const [freezes, setFreezes] = useState(getStreakFreezes)
  const [history, setHistory] = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const [syncStatus, setSyncStatus] = useState('saved') // 'saved' | 'saving' | 'error'

  const [showCelebration, setShowCelebration] = useState(false)

  const [dark, setDark] = useState(() => localStorage.getItem(THEME_KEY) === 'dark')
  const [activeTab, setActiveTab] = useState('prayers')

  const { prayerTimes, nextPrayer, nextPrayerTime, loading, error } = usePrayerTimes()
  const { notificationSettings, updateNotificationSettings, notificationsSupported } = useNotifications(prayerTimes)

  const latestRef = useRef({ prayers: defaultPrayers(), streak: 0 })
  const dirtyRef = useRef(false)
  const tokenRef = useRef(null)
  const initialLoadRef = useRef(true)
  const retryTimerRef = useRef(null)
  const saveTimerRef = useRef(null)
  const celebratedTodayRef = useRef(false)

  // Always keep latestRef in sync so flush has current values
  useEffect(() => {
    latestRef.current = { prayers, streak }
  })

  // Keep access token cached for synchronous flush on page close.
  // Also refreshes the token proactively so saves never use an expired JWT.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      tokenRef.current = data?.session?.access_token ?? null
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        tokenRef.current = session?.access_token ?? null
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  /** Ensure a fresh token before any save. Triggers Supabase auto-refresh if needed. */
  const ensureFreshToken = async () => {
    const { data } = await supabase.auth.getSession()
    const token = data?.session?.access_token ?? null
    tokenRef.current = token
    return token
  }

  // Flush pending save on page close / app switch.
  // Reload fresh data when the app becomes visible again (cross-device sync).
  useEffect(() => {
    function flush() {
      // Cancel any pending debounced save — we'll flush directly instead
      clearTimeout(saveTimerRef.current)
      clearTimeout(retryTimerRef.current)
      if (dirtyRef.current && tokenRef.current) {
        const { prayers: p, streak: s } = latestRef.current
        flushSave(tokenRef.current, user.id, getToday(), p, s)
        dirtyRef.current = false
      }
    }

    async function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        flush()
      } else if (document.visibilityState === 'visible') {
        // App came back to foreground — refresh token and reload data.
        // Mark as loading so the save effect doesn't re-save what we just fetched.
        try {
          await ensureFreshToken()
          const today = getToday()
          const { data } = await fetchTodayPrayers(user.id, today)
          if (data) {
            initialLoadRef.current = true
            setPrayers(rowToPrayers(data))
            setStreak(data.streak)
          }
        } catch { /* ignore — non-critical refresh */ }
      }
    }

    window.addEventListener('beforeunload', flush)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', flush)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      flush()
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
          // If all 5 already done, suppress celebration for this session
          const row = todayRes.data
          if ([row.fajr, row.dhuhr, row.asr, row.maghrib, row.isha].every(Boolean)) {
            celebratedTodayRef.current = true
          }
        } else {
          const yRow = yesterdayRes.data
          if (yRow) {
            const allDone = [yRow.fajr, yRow.dhuhr, yRow.asr, yRow.maghrib, yRow.isha].every(Boolean)
            if (allDone) {
              setStreak((yRow.streak ?? 0) + 1)
            } else {
              // Yesterday wasn't perfect — try to use a streak freeze
              const yesterday = getYesterday()
              const currentFreezes = getStreakFreezes()
              if (currentFreezes > 0 && getLastFreezeUsed() !== yesterday) {
                setStreakFreezes(currentFreezes - 1)
                setFreezes(currentFreezes - 1)
                setLastFreezeUsed(yesterday)
                setStreak((yRow.streak ?? 0) + 1)
              } else {
                setStreak(0)
              }
            }
          } else {
            // No data for yesterday at all — try freeze
            const yesterday = getYesterday()
            const currentFreezes = getStreakFreezes()
            if (currentFreezes > 0 && streak > 0 && getLastFreezeUsed() !== yesterday) {
              setStreakFreezes(currentFreezes - 1)
              setFreezes(currentFreezes - 1)
              setLastFreezeUsed(yesterday)
              // Keep current streak (don't reset)
            } else {
              setStreak(0)
            }
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

  // Save on prayer change with debounce and retry
  useEffect(() => {
    if (dataLoading) return

    // Skip the very first run right after loading from DB
    if (initialLoadRef.current) {
      initialLoadRef.current = false
      return
    }

    clearTimeout(retryTimerRef.current)
    clearTimeout(saveTimerRef.current)
    dirtyRef.current = true
    setSyncStatus('saving')

    // Debounce 300ms so rapid toggles don't fire multiple concurrent saves
    saveTimerRef.current = setTimeout(() => {
      const prayerSnapshot = { ...prayers }
      const streakSnapshot = streak

      async function save(attempt = 1) {
        try {
          if (attempt > 1) await ensureFreshToken()

          const { error: saveError } = await upsertTodayPrayers(
            user.id, getToday(), prayerSnapshot, streakSnapshot
          )

          if (saveError) {
            console.error(`Save failed (attempt ${attempt}):`, saveError)
            if (attempt < 3) {
              retryTimerRef.current = setTimeout(() => save(attempt + 1), 1500 * attempt)
            } else {
              setSyncStatus('error')
            }
          } else {
            dirtyRef.current = false
            setSyncStatus('saved')
          }
        } catch (err) {
          console.error(`Save exception (attempt ${attempt}):`, err)
          if (attempt < 3) {
            retryTimerRef.current = setTimeout(() => save(attempt + 1), 1500 * attempt)
          } else {
            setSyncStatus('error')
          }
        }
      }

      save()
    }, 300)

    return () => {
      clearTimeout(retryTimerRef.current)
      clearTimeout(saveTimerRef.current)
    }
  }, [prayers, streak, user.id, dataLoading])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light')
  }, [dark])

  // Celebrate when all 5 prayers completed (once per day)
  useEffect(() => {
    if (initialLoadRef.current || celebratedTodayRef.current) return
    const allDone = Object.values(prayers).every(Boolean)
    if (allDone) {
      celebratedTodayRef.current = true
      setShowCelebration(true)
    }
  }, [prayers])

  // Earn a streak freeze every 7 consecutive days (max 3)
  useEffect(() => {
    const todayComplete = Object.values(prayers).every(Boolean)
    const currentStreak = streak + (todayComplete ? 1 : 0)
    if (currentStreak > 0 && currentStreak % 7 === 0) {
      const earnedKey = `streak-freeze-earned-${currentStreak}`
      if (!localStorage.getItem(earnedKey)) {
        const newFreezes = Math.min(getStreakFreezes() + 1, 3)
        setStreakFreezes(newFreezes)
        setFreezes(newFreezes)
        localStorage.setItem(earnedKey, '1')
      }
    }
  }, [streak, prayers])

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
      <CelebrationModal
        show={showCelebration}
        streak={streak}
        onClose={() => setShowCelebration(false)}
      />
      <div className="w-full max-w-md">
        <Header
          streak={activeTab === 'prayers' ? streak : undefined}
          nextPrayer={activeTab === 'prayers' ? nextPrayer : undefined}
          nextPrayerTime={activeTab === 'prayers' ? nextPrayerTime : undefined}
          loading={activeTab === 'prayers' ? loading : false}
          error={activeTab === 'prayers' ? error : null}
          syncStatus={syncStatus}
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
              <QuickTools />
            </motion.div>
          )}

          {activeTab === 'progress' && (
            <motion.div key="progress" variants={tabVariants} initial="initial" animate="animate" exit="exit">
              <ProgressTab prayers={prayers} streak={streak} history={history} freezes={freezes} />
            </motion.div>
          )}

          {activeTab === 'quran' && (
            <motion.div key="quran" variants={tabVariants} initial="initial" animate="animate" exit="exit">
              <QuranReader />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div key="settings" variants={tabVariants} initial="initial" animate="animate" exit="exit">
              <SettingsTab
                dark={dark}
                onToggleTheme={() => setDark((d) => !d)}
                notificationSettings={notificationSettings}
                onUpdateNotificationSettings={updateNotificationSettings}
                notificationsSupported={notificationsSupported}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
    </div>
  )
}
