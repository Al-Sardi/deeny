/**
 * TasbihCounter — A minimalistic digital prayer bead counter.
 * Tap the circle to count, select target (33/99/∞), reset anytime.
 * Data is persisted to Supabase with a debounced save (300 ms).
 */
import { useState, useCallback, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchTasbih, upsertTasbih } from '../lib/supabaseTasbih'

const TARGETS = [33, 99, null] // null = no limit
const TARGET_LABELS = ['33', '99', '∞']

export default function TasbihCounter() {
  const { user } = useAuth()

  const [count, setCount] = useState(0)
  const [target, setTarget] = useState(33)
  const [total, setTotal] = useState(0)
  const [pulse, setPulse] = useState(false)
  const [reached, setReached] = useState(false)
  const [loading, setLoading] = useState(true)

  const timeoutRef = useRef(null)
  const saveTimerRef = useRef(null)

  // Ref that always holds the latest values (for unmount flush)
  const latestRef = useRef({ count: 0, target: 33, total: 0 })
  useEffect(() => {
    latestRef.current = { count, target, total }
  })

  // ── Load tasbih data from Supabase on mount ─────────────
  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const { data } = await fetchTasbih(user.id)
        if (cancelled) return

        if (data) {
          setCount(data.count)
          setTarget(data.target)
          setTotal(data.total)
        } else {
          // No row yet — check localStorage for one-time migration
          try {
            const raw = localStorage.getItem('tasbih-data')
            if (raw) {
              const saved = JSON.parse(raw)
              if (saved) {
                setCount(saved.count ?? 0)
                setTarget(saved.target ?? 33)
                setTotal(saved.total ?? 0)
                // Migrate to Supabase
                await upsertTasbih(user.id, {
                  count: saved.count ?? 0,
                  target: saved.target ?? 33,
                  total: saved.total ?? 0,
                })
                localStorage.removeItem('tasbih-data')
              }
            }
          } catch { /* ignore migration errors */ }
        }
      } catch (err) {
        console.error('Failed to load tasbih:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [user.id])

  // ── Flush pending save on unmount ────────────────────────
  useEffect(() => {
    return () => {
      clearTimeout(saveTimerRef.current)
      // Best-effort save with the latest values
      upsertTasbih(user.id, latestRef.current).catch(() => {})
    }
  }, [user.id])

  // ── Debounced save helper ────────────────────────────────
  const debouncedSave = useCallback(
    (newData) => {
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        upsertTasbih(user.id, newData).catch((err) =>
          console.error('Failed to save tasbih:', err)
        )
      }, 300)
    },
    [user.id]
  )

  // ── Handlers ─────────────────────────────────────────────

  const handleTap = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(10)

    setCount((prev) => {
      const newCount = prev + 1
      setTotal((prevTotal) => {
        const newTotal = prevTotal + 1
        debouncedSave({ count: newCount, target, total: newTotal })
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
  }, [target, debouncedSave])

  const handleReset = useCallback(() => {
    setCount(0)
    setTotal((prev) => {
      debouncedSave({ count: 0, target, total: prev })
      return prev
    })
  }, [target, debouncedSave])

  const handleTargetChange = useCallback(
    (newTarget) => {
      setTarget(newTarget)
      setCount((prevCount) => {
        setTotal((prevTotal) => {
          debouncedSave({ count: prevCount, target: newTarget, total: prevTotal })
          return prevTotal
        })
        return prevCount
      })
    },
    [debouncedSave]
  )

  // ── Progress ring values ─────────────────────────────────
  const progress = target ? Math.min(count / target, 1) : 0
  const circumference = 2 * Math.PI * 90
  const strokeOffset = circumference - progress * circumference

  // ── Loading spinner ──────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Counter card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col items-center gap-6">
          {/* Target selector */}
          <div className="flex items-center gap-2">
            {TARGETS.map((t, i) => (
              <button
                key={TARGET_LABELS[i]}
                onClick={() => handleTargetChange(t)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-200
                  ${
                    target === t
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                  }`}
              >
                {TARGET_LABELS[i]}
              </button>
            ))}
          </div>

          {/* Counter circle with progress ring */}
          <button
            onClick={handleTap}
            className={`relative flex h-52 w-52 items-center justify-center rounded-full
              bg-zinc-50 shadow-inner transition-transform duration-150 ease-out
              active:scale-95
              dark:bg-zinc-800/50
              ${pulse ? 'scale-[1.03]' : 'scale-100'}
              ${reached ? 'ring-4 ring-emerald-400/60' : ''}`}
          >
            {/* SVG progress ring */}
            {target && (
              <svg
                className="absolute inset-0 -rotate-90"
                width="208"
                height="208"
                viewBox="0 0 200 200"
              >
                {/* Background track */}
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-zinc-200 dark:text-zinc-700"
                />
                {/* Progress arc */}
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                  className="text-emerald-500 transition-all duration-300 ease-out"
                />
              </svg>
            )}

            {/* Count display */}
            <div className="z-10 flex flex-col items-center">
              <span
                className={`text-5xl font-semibold tabular-nums tracking-tight transition-all duration-150
                  ${reached ? 'text-emerald-500' : 'text-zinc-900 dark:text-zinc-100'}`}
              >
                {count}
              </span>
              {target && (
                <span className="mt-1 text-sm tabular-nums text-zinc-400 dark:text-zinc-500">
                  / {target}
                </span>
              )}
            </div>
          </button>

          {/* Reached message */}
          <div className={`h-5 transition-all duration-300 ${reached ? 'opacity-100' : 'opacity-0'}`}>
            <span className="text-sm font-medium text-emerald-500">
              Target reached!
            </span>
          </div>
        </div>
      </div>

      {/* Bottom row: total + reset */}
      <div className="flex items-center justify-between px-1">
        <span className="text-sm text-zinc-400 tabular-nums dark:text-zinc-500">
          Total: {total.toLocaleString()}
        </span>
        {count > 0 && (
          <button
            onClick={handleReset}
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-zinc-500 dark:hover:bg-red-950/50 dark:hover:text-red-400"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  )
}
