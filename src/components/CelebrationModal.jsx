import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Flame, Zap, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

const card = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 25, delay: 0.1 },
  },
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15 } },
}

const sparkle = {
  initial: { scale: 0, rotate: -30 },
  animate: {
    scale: [0, 1.2, 1],
    rotate: [-30, 10, 0],
    transition: { duration: 0.5, delay: 0.3 },
  },
}

export default function CelebrationModal({ show, streak, onClose }) {
  const { t } = useTranslation()

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center px-5"
          variants={backdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Card */}
          <motion.div
            className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-zinc-200 bg-white p-8 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900"
            variants={card}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            >
              <X size={18} />
            </button>

            {/* Sparkle icon */}
            <motion.div
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/30"
              variants={sparkle}
              initial="initial"
              animate="animate"
            >
              <Sparkles size={28} className="text-emerald-500" strokeWidth={1.5} />
            </motion.div>

            {/* Arabic blessing */}
            <p className="mb-1 text-center text-3xl leading-relaxed text-emerald-700 dark:text-emerald-400" dir="rtl">
              {t('celebration.arabic')}
            </p>

            {/* Transliteration */}
            <p className="mb-3 text-center text-sm font-medium text-zinc-400 dark:text-zinc-500">
              {t('celebration.transliteration')}
            </p>

            {/* Message */}
            <p className="mb-6 text-center text-base text-zinc-600 dark:text-zinc-300">
              {t('celebration.message')}
            </p>

            {/* Badges */}
            <div className="mb-6 flex items-center justify-center gap-3">
              {/* XP badge */}
              <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                <Zap size={14} strokeWidth={2} />
                {t('celebration.xp_earned')}
              </div>

              {/* Streak badge */}
              <div className="flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                <Flame size={14} strokeWidth={2} />
                {streak} {t('celebration.streak_maintained')}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-2.5">
              <button
                onClick={onClose}
                className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98]"
              >
                {t('celebration.alhamdulillah')}
              </button>
              <button
                onClick={onClose}
                className="w-full rounded-xl border border-zinc-200 bg-white py-3 text-sm font-medium text-zinc-500 transition hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              >
                {t('celebration.close')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
