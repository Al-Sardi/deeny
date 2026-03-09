import { useState, useEffect } from 'react'
import Header from './components/Header'
import PrayerList from './components/PrayerList'
import ProgressBar from './components/ProgressBar'
import WeeklyStats from './components/WeeklyStats'
import DailyAyah from './components/DailyAyah'
import TasbihCounter from './components/TasbihCounter'
import StreaksTab from './components/StreaksTab'
import CalendarTab from './components/CalendarTab'
import BottomNav from './components/BottomNav'
import usePrayerTimes from './hooks/usePrayerTimes'

const STORAGE_KEY = 'prayer-tracker'
const THEME_KEY = 'prayer-theme'
const TOTAL_PRAYERS = 5

/** Default state: all prayers unchecked */
const defaultPrayers = () => ({
  Fajr: false,
  Dhuhr: false,
  Asr: false,
  Maghrib: false,
  Isha: false,
})

/** Get today's date as YYYY-MM-DD string */
const getToday = () => new Date().toISOString().split('T')[0]

/** Get yesterday's date as YYYY-MM-DD string */
const getYesterday = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

/**
 * Archive a day's prayers into history, keeping at most 90 past entries.
 * This supports the calendar view (3 months) and weekly stats.
 */
function archiveDay(date, prayers, existingHistory) {
  return [{ date, prayers: { ...prayers } }, ...existingHistory].slice(0, 90)
}

/**
 * Load saved data from localStorage.
 * Handles daily reset, streak calculation, and history archiving:
 * - Same day → restore prayers, streak, and history as-is
 * - Yesterday with all 5 completed → archive, reset prayers, streak +1
 * - Yesterday incomplete → archive, reset prayers and streak
 * - Older → archive, reset prayers and streak
 */
function loadData() {
  const defaults = { prayers: defaultPrayers(), streak: 0, history: [] }

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (!saved) return defaults

    const today = getToday()
    const previousHistory = saved.history ?? []

    // Same day — restore everything
    if (saved.date === today) {
      return {
        prayers: saved.prayers,
        streak: saved.streak ?? 0,
        history: previousHistory,
      }
    }

    // Yesterday — archive and check streak
    if (saved.date === getYesterday()) {
      const allDone = Object.values(saved.prayers).every(Boolean)
      return {
        prayers: defaultPrayers(),
        streak: allDone ? (saved.streak ?? 0) + 1 : 0,
        history: archiveDay(saved.date, saved.prayers, previousHistory),
      }
    }

    // Older than yesterday — archive but reset streak
    return {
      prayers: defaultPrayers(),
      streak: 0,
      history: archiveDay(saved.date, saved.prayers, previousHistory),
    }
  } catch {
    return defaults
  }
}

export default function App() {
  const [data] = useState(loadData)
  const [prayers, setPrayers] = useState(data.prayers)
  const [streak, setStreak] = useState(data.streak)
  const [history] = useState(data.history)
  const [dark, setDark] = useState(() => localStorage.getItem(THEME_KEY) === 'dark')
  const [activeTab, setActiveTab] = useState('prayers')

  const { prayerTimes, nextPrayer, nextPrayerTime, loading, error } = usePrayerTimes()

  // Persist to localStorage whenever prayers or streak change
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ date: getToday(), prayers, streak, history })
    )
  }, [prayers, streak, history])

  // Apply dark class to <html> and persist preference
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light')
  }, [dark])

  /** Toggle a prayer's completion status */
  const togglePrayer = (name) => {
    setPrayers((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  /** Reset all prayers for today */
  const resetToday = () => {
    setPrayers(defaultPrayers())
  }

  const completedCount = Object.values(prayers).filter(Boolean).length

  return (
    <div className="flex min-h-dvh items-start justify-center bg-gray-50 px-4 pt-12 pb-24 dark:bg-gray-900 transition-colors">
      <div className="w-full max-w-md">
        <Header
          streak={activeTab === 'prayers' ? streak : undefined}
          showStreakAndPrayer={activeTab === 'prayers'}
          dark={dark}
          onToggleTheme={() => setDark((d) => !d)}
          nextPrayer={activeTab === 'prayers' ? nextPrayer : undefined}
          nextPrayerTime={activeTab === 'prayers' ? nextPrayerTime : undefined}
          loading={activeTab === 'prayers' ? loading : false}
          error={activeTab === 'prayers' ? error : null}
        />

        {activeTab === 'prayers' && (
          <>
            <DailyAyah />
            <PrayerList
              prayers={prayers}
              onToggle={togglePrayer}
              onReset={resetToday}
              prayerTimes={prayerTimes}
            />
            <div className="mt-8">
              <ProgressBar completed={completedCount} total={TOTAL_PRAYERS} />
            </div>
            <div className="mt-4">
              <WeeklyStats prayers={prayers} history={history} />
            </div>
          </>
        )}

        {activeTab === 'tasbih' && <TasbihCounter />}

        {activeTab === 'streaks' && (
          <StreaksTab prayers={prayers} streak={streak} history={history} />
        )}

        {activeTab === 'calendar' && (
          <CalendarTab prayers={prayers} history={history} />
        )}
      </div>

      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
    </div>
  )
}
