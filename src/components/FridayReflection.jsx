import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Sparkles, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { createReflection } from '../lib/supabaseReflections'
import ReflectionInput from './ReflectionInput'
import ReflectionTimeline from './ReflectionTimeline'

export default function FridayReflection() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [showInput, setShowInput] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)

  const isFriday = new Date().getDay() === 5

  async function handleSave(data) {
    const { error } = await createReflection(user.id, data)
    if (error) {
      console.error('Failed to save reflection:', error)
      return
    }
    setShowInput(false)
    // Open the timeline so user can see their saved reflection
    setShowTimeline(true)
  }

  return (
    <>
      {/* Friday Reflection Card — always visible, highlighted on Fridays */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`rounded-2xl border p-4 shadow-sm ${
          isFriday
            ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 dark:border-emerald-800/50 dark:from-emerald-950/30 dark:to-teal-950/20'
            : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isFriday
              ? 'bg-emerald-100 dark:bg-emerald-900/40'
              : 'bg-emerald-50 dark:bg-emerald-900/20'
          }`}>
            {isFriday ? (
              <Sparkles size={18} className="text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
            ) : (
              <BookOpen size={18} className="text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {isFriday ? t('reflection.friday_title') : t('reflection.card_title')}
            </p>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              {isFriday ? t('reflection.friday_subtitle') : t('reflection.card_subtitle')}
            </p>

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => setShowInput(true)}
                className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-600"
              >
                {t('reflection.write_button')}
              </button>
              <button
                onClick={() => setShowTimeline(true)}
                className="flex items-center gap-0.5 rounded-lg px-2 py-1.5 text-xs font-medium text-emerald-600 transition hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
              >
                {t('reflection.view_all')}
                <ChevronRight size={14} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Input overlay */}
      <AnimatePresence>
        {showInput && (
          <ReflectionInput
            onSave={handleSave}
            onClose={() => setShowInput(false)}
          />
        )}
      </AnimatePresence>

      {/* Timeline overlay */}
      <AnimatePresence>
        {showTimeline && (
          <ReflectionTimeline onClose={() => setShowTimeline(false)} />
        )}
      </AnimatePresence>
    </>
  )
}
