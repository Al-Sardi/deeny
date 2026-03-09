import { useState, useCallback, useRef } from 'react'

const TASBIH_KEY = 'tasbih-data'
const TARGETS = [33, 99, null] // null = no limit
const TARGET_LABELS = ['33', '99', '∞']

function loadTasbih() {
  try {
    const saved = JSON.parse(localStorage.getItem(TASBIH_KEY))
    if (saved) return saved
  } catch { /* ignore */ }
  return { count: 0, target: 33, total: 0 }
}

function saveTasbih(data) {
  localStorage.setItem(TASBIH_KEY, JSON.stringify(data))
}

/**
 * TasbihCounter - A minimalistic digital prayer bead counter.
 * Tap the circle to count, select target (33/99/∞), reset anytime.
 */
export default function TasbihCounter() {
  const [count, setCount] = useState(() => loadTasbih().count)
  const [target, setTarget] = useState(() => loadTasbih().target)
  const [total, setTotal] = useState(() => loadTasbih().total)
  const [pulse, setPulse] = useState(false)
  const [reached, setReached] = useState(false)
  const timeoutRef = useRef(null)



  const handleTap = useCallback(() => {
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(10)

    setCount((prev) => {
      const newCount = prev + 1
      setTotal((prevTotal) => {
        const newTotal = prevTotal + 1
        saveTasbih({ count: newCount, target, total: newTotal })
        return newTotal
      })

      // Target reached
      if (target && newCount === target) {
        setReached(true)
        setTimeout(() => setReached(false), 1500)
      }

      return newCount
    })

    // Pulse animation
    setPulse(true)
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setPulse(false), 150)
  }, [target])

  const handleReset = useCallback(() => {
    setCount(0)
    setTotal((prev) => {
      saveTasbih({ count: 0, target, total: prev })
      return prev
    })
  }, [target])

  const handleTargetChange = useCallback((newTarget) => {
    setTarget(newTarget)
    setCount((prevCount) => {
      setTotal((prevTotal) => {
        saveTasbih({ count: prevCount, target: newTarget, total: prevTotal })
        return prevTotal
      })
      return prevCount
    })
  }, [])

  // Progress for the SVG ring (0 to 1)
  const progress = target ? Math.min(count / target, 1) : 0
  const circumference = 2 * Math.PI * 90 // radius = 90
  const strokeOffset = circumference - progress * circumference

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Target selector */}
      <div className="flex items-center gap-2">
        {TARGETS.map((t, i) => (
          <button
            key={TARGET_LABELS[i]}
            onClick={() => handleTargetChange(t)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-200
              ${
                target === t
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'bg-white text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
          >
            {TARGET_LABELS[i]}
          </button>
        ))}
      </div>

      {/* Counter circle with progress ring */}
      <div className="relative">
        <button
          onClick={handleTap}
          className={`relative flex h-56 w-56 items-center justify-center rounded-full
            bg-white shadow-lg transition-transform duration-150 ease-out
            active:scale-95
            dark:bg-gray-800 dark:shadow-gray-950/40
            ${pulse ? 'scale-[1.03]' : 'scale-100'}
            ${reached ? 'ring-4 ring-green-400 ring-opacity-60' : ''}`}
        >
          {/* SVG progress ring */}
          {target && (
            <svg
              className="absolute inset-0 -rotate-90"
              width="224"
              height="224"
              viewBox="0 0 200 200"
            >
              {/* Background track */}
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-gray-100 dark:text-gray-700"
              />
              {/* Progress arc */}
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                className="text-green-500 transition-all duration-300 ease-out"
              />
            </svg>
          )}

          {/* Count display */}
          <div className="z-10 flex flex-col items-center">
            <span
              className={`text-6xl font-bold tabular-nums transition-all duration-150
                ${reached ? 'text-green-500' : 'text-gray-800 dark:text-gray-100'}`}
            >
              {count}
            </span>
            {target && (
              <span className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                / {target}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Reached message */}
      <div className={`h-6 transition-all duration-300 ${reached ? 'opacity-100' : 'opacity-0'}`}>
        <span className="text-sm font-medium text-green-500">
          Target reached!
        </span>
      </div>

      {/* Bottom row: total + reset */}
      <div className="flex w-full items-center justify-between px-4">
        <span className="text-sm text-gray-400 dark:text-gray-500">
          Total: {total}
        </span>
        {count > 0 && (
          <button
            onClick={handleReset}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-400 transition-colors hover:text-red-500 hover:bg-red-50 dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-950"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  )
}
