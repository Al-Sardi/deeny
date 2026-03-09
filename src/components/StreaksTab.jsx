import { useState, useEffect } from 'react'

const ACHIEVEMENTS_KEY = 'achievements-data'

/**
 * Achievement definitions.
 * Each has an id, label, description, icon, and a check function
 * that receives stats and returns true when unlocked.
 */
const ACHIEVEMENTS = [
  {
    id: 'first-prayer',
    label: 'First Step',
    description: 'Complete your first prayer',
    icon: '🌱',
    check: (s) => s.totalPrayers >= 1,
  },
  {
    id: 'perfect-day',
    label: 'Perfect Day',
    description: 'Complete all 5 prayers in a day',
    icon: '⭐',
    check: (s) => s.perfectDays >= 1,
  },
  {
    id: 'streak-3',
    label: 'On Fire',
    description: 'Reach a 3-day streak',
    icon: '🔥',
    check: (s) => s.bestStreak >= 3,
  },
  {
    id: 'streak-7',
    label: 'Week Warrior',
    description: 'Reach a 7-day streak',
    icon: '🏅',
    check: (s) => s.bestStreak >= 7,
  },
  {
    id: 'streak-30',
    label: 'Unstoppable',
    description: 'Reach a 30-day streak',
    icon: '👑',
    check: (s) => s.bestStreak >= 30,
  },
  {
    id: 'prayers-50',
    label: 'Devoted',
    description: 'Complete 50 prayers total',
    icon: '🕌',
    check: (s) => s.totalPrayers >= 50,
  },
  {
    id: 'prayers-100',
    label: 'Centurion',
    description: 'Complete 100 prayers total',
    icon: '💯',
    check: (s) => s.totalPrayers >= 100,
  },
  {
    id: 'prayers-500',
    label: 'Faithful',
    description: 'Complete 500 prayers total',
    icon: '🌟',
    check: (s) => s.totalPrayers >= 500,
  },
  {
    id: 'tasbih-1000',
    label: 'Tasbih Master',
    description: 'Count 1,000 tasbih total',
    icon: '📿',
    check: (s) => s.tasbihTotal >= 1000,
  },
  {
    id: 'perfect-week',
    label: 'Perfect Week',
    description: 'Complete all prayers every day for a week',
    icon: '🏆',
    check: (s) => s.weeklyPerfect >= 7,
  },
]

/** Load persisted achievement data */
function loadAchievements() {
  try {
    const saved = JSON.parse(localStorage.getItem(ACHIEVEMENTS_KEY))
    if (saved) return saved
  } catch { /* ignore */ }
  return { totalPrayers: 0, bestStreak: 0, perfectDays: 0, unlocked: [] }
}

/** Save achievement data to localStorage */
function saveAchievements(data) {
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(data))
}

/**
 * Compute current stats from app state + localStorage.
 * This merges persisted totals with live session data.
 */
function computeStats(prayers, streak, history) {
  const saved = loadAchievements()

  // Count today's completed prayers
  const todayCompleted = Object.values(prayers).filter(Boolean).length
  const todayPerfect = todayCompleted === 5

  // Count total prayers: persisted total + today's (avoid double-counting)
  // We track cumulative in localStorage, updated on each computation
  const historyPrayers = history.reduce((sum, day) => {
    return sum + Object.values(day.prayers).filter(Boolean).length
  }, 0)
  const totalPrayers = Math.max(saved.totalPrayers, historyPrayers + todayCompleted)

  // Perfect days from history + today
  const historyPerfectDays = history.filter(
    (day) => Object.values(day.prayers).every(Boolean)
  ).length
  const perfectDays = Math.max(saved.perfectDays, historyPerfectDays + (todayPerfect ? 1 : 0))

  // Best streak: max of saved best and current
  const bestStreak = Math.max(saved.bestStreak, streak + (todayPerfect ? 1 : 0))

  // Weekly perfect: days in last 7 with all 5 done
  const weeklyPerfect = historyPerfectDays + (todayPerfect ? 1 : 0)

  // Tasbih total from its own localStorage key
  let tasbihTotal = 0
  try {
    const tasbih = JSON.parse(localStorage.getItem('tasbih-data'))
    if (tasbih) tasbihTotal = tasbih.total ?? 0
  } catch { /* ignore */ }

  return { totalPrayers, bestStreak, perfectDays, weeklyPerfect, tasbihTotal }
}

/**
 * StreaksTab - Displays streak info and unlockable achievements.
 */
export default function StreaksTab({ prayers, streak, history }) {
  const [stats, setStats] = useState(() => computeStats(prayers, streak, history))
  const [unlocked, setUnlocked] = useState(() => loadAchievements().unlocked ?? [])
  const [newlyUnlocked, setNewlyUnlocked] = useState([])

  // Recompute stats when prayers/streak/history change
  useEffect(() => {
    const newStats = computeStats(prayers, streak, history)
    setStats(newStats)

    // Check for newly unlocked achievements
    const currentUnlocked = loadAchievements().unlocked ?? []
    const freshUnlocks = []

    ACHIEVEMENTS.forEach((a) => {
      if (!currentUnlocked.includes(a.id) && a.check(newStats)) {
        freshUnlocks.push(a.id)
      }
    })

    if (freshUnlocks.length > 0) {
      const allUnlocked = [...currentUnlocked, ...freshUnlocks]
      setUnlocked(allUnlocked)
      setNewlyUnlocked(freshUnlocks)

      // Persist updated achievements
      saveAchievements({
        totalPrayers: newStats.totalPrayers,
        bestStreak: newStats.bestStreak,
        perfectDays: newStats.perfectDays,
        unlocked: allUnlocked,
      })

      // Clear "new" animation after 2 seconds
      setTimeout(() => setNewlyUnlocked([]), 2000)
    } else {
      // Still persist updated stats
      saveAchievements({
        totalPrayers: newStats.totalPrayers,
        bestStreak: newStats.bestStreak,
        perfectDays: newStats.perfectDays,
        unlocked: currentUnlocked,
      })
    }
  }, [prayers, streak, history])

  const todayComplete = Object.values(prayers).filter(Boolean).length === 5

  return (
    <div className="flex flex-col gap-6">
      {/* Streak cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Daily streak */}
        <div className="flex flex-col items-center gap-1 rounded-xl bg-white px-4 py-5 shadow-sm dark:bg-gray-800">
          <span className="text-3xl">🔥</span>
          <span className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            {streak + (todayComplete ? 1 : 0)}
          </span>
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
            Day Streak
          </span>
        </div>

        {/* Best streak */}
        <div className="flex flex-col items-center gap-1 rounded-xl bg-white px-4 py-5 shadow-sm dark:bg-gray-800">
          <span className="text-3xl">⭐</span>
          <span className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            {stats.bestStreak}
          </span>
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
            Best Streak
          </span>
        </div>

        {/* Weekly completion */}
        <div className="flex flex-col items-center gap-1 rounded-xl bg-white px-4 py-5 shadow-sm dark:bg-gray-800">
          <span className="text-3xl">📅</span>
          <span className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            {stats.weeklyPerfect}<span className="text-lg text-gray-400 dark:text-gray-500">/7</span>
          </span>
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
            This Week
          </span>
        </div>

        {/* Total prayers */}
        <div className="flex flex-col items-center gap-1 rounded-xl bg-white px-4 py-5 shadow-sm dark:bg-gray-800">
          <span className="text-3xl">🕌</span>
          <span className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            {stats.totalPrayers}
          </span>
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
            Total Prayers
          </span>
        </div>
      </div>

      {/* Achievements section */}
      <div>
        <h2 className="mb-3 text-center text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Achievements
        </h2>
        <div className="flex flex-col gap-2">
          {ACHIEVEMENTS.map((a) => {
            const isUnlocked = unlocked.includes(a.id)
            const isNew = newlyUnlocked.includes(a.id)

            return (
              <div
                key={a.id}
                className={`flex items-center gap-4 rounded-xl px-4 py-3 transition-all duration-500
                  ${isUnlocked
                    ? 'bg-white shadow-sm dark:bg-gray-800'
                    : 'bg-gray-100/50 dark:bg-gray-800/40'
                  }
                  ${isNew ? 'animate-bounce ring-2 ring-green-400' : ''}`}
              >
                {/* Icon */}
                <span
                  className={`text-2xl transition-all duration-500
                    ${isUnlocked ? 'opacity-100 scale-100' : 'opacity-30 scale-90 grayscale'}`}
                >
                  {a.icon}
                </span>

                {/* Label + description */}
                <div className="flex-1">
                  <p
                    className={`text-sm font-semibold transition-colors duration-300
                      ${isUnlocked
                        ? 'text-gray-800 dark:text-gray-100'
                        : 'text-gray-400 dark:text-gray-600'
                      }`}
                  >
                    {a.label}
                  </p>
                  <p
                    className={`text-xs transition-colors duration-300
                      ${isUnlocked
                        ? 'text-gray-500 dark:text-gray-400'
                        : 'text-gray-300 dark:text-gray-700'
                      }`}
                  >
                    {a.description}
                  </p>
                </div>

                {/* Unlocked badge */}
                {isUnlocked && (
                  <span className="text-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
