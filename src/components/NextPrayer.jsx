// NextPrayer is now inlined in Header.jsx — this file kept for compatibility
import { Clock } from 'lucide-react'

export default function NextPrayer({ nextPrayer, nextPrayerTime, loading, error }) {
  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-zinc-300 border-t-transparent dark:border-zinc-600" />
        <span className="text-sm text-zinc-400 dark:text-zinc-500">Loading prayer times…</span>
      </div>
    )
  }

  if (error) return <p className="text-sm text-zinc-400 dark:text-zinc-500">{error}</p>

  if (!nextPrayer) {
    return <p className="text-sm text-zinc-400 dark:text-zinc-500">All prayers passed for today</p>
  }

  return (
    <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
      <Clock size={14} strokeWidth={1.5} />
      <span>
        Next: <span className="font-medium text-zinc-900 dark:text-zinc-100">{nextPrayer}</span>
        {' '}at{' '}
        <span className="font-medium text-emerald-600 dark:text-emerald-400">{nextPrayerTime}</span>
      </span>
    </div>
  )
}
