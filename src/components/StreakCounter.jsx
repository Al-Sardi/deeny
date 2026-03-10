// StreakCounter is now inlined in Header.jsx — this file kept for compatibility
import { Flame } from 'lucide-react'

export default function StreakCounter({ streak }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 dark:bg-orange-950/40">
      <Flame size={14} className="text-orange-500" fill="currentColor" />
      <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
        {streak}
      </span>
    </div>
  )
}
