import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Shield } from 'lucide-react'
import ProgressOverview from './ProgressOverview'
import PrayerHeatmap from './PrayerHeatmap'

import WeeklyStats from './WeeklyStats'
import Achievements from './Achievements'
import CollapsibleCard from './CollapsibleCard'

export default function ProgressTab({ prayers, streak, history, freezes = 0 }) {
  const { t } = useTranslation()
  const [expandedCard, setExpandedCard] = useState(null)

  const toggleCard = (id) =>
    setExpandedCard((prev) => (prev === id ? null : id))

  return (
    <div className="space-y-8">
      {/* ── OVERVIEW ── */}
      <section>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500"
        >
          {t('progress.overview')}
        </motion.p>
        <ProgressOverview prayers={prayers} streak={streak} history={history} />
      </section>

      {/* ── STREAK FREEZE ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20">
              <Shield size={18} className="text-blue-500" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {t('freeze.title')}
              </p>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                {t('freeze.description')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  i < freezes
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-zinc-200 dark:border-zinc-700'
                }`}
              >
                {i < freezes && (
                  <Shield size={12} className="text-white" strokeWidth={2.5} />
                )}
              </div>
            ))}
          </div>
        </div>
        <p className="mt-2 text-[10px] text-zinc-400 dark:text-zinc-500">
          {t('freeze.earn_hint')}
        </p>
      </motion.div>

      {/* ── ACTIVITY ── */}
      <section>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500"
        >
          {t('progress.prayer_activity')}
        </motion.p>
        <div className="space-y-4">
          <PrayerHeatmap prayers={prayers} history={history} />
        </div>
      </section>

      {/* ── STATISTICS ── */}
      <section>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500"
        >
          {t('progress.statistics')}
        </motion.p>
        <div className="space-y-4">
          <WeeklyStats prayers={prayers} history={history} />

          <CollapsibleCard
            title={t('progress.achievements')}
            icon="🏆"
            expanded={expandedCard === 'achievements'}
            onToggle={() => toggleCard('achievements')}
          >
            <Achievements prayers={prayers} streak={streak} history={history} inline />
          </CollapsibleCard>
        </div>
      </section>
    </div>
  )
}
