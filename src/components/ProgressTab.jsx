import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import ProgressOverview from './ProgressOverview'
import PrayerHeatmap from './PrayerHeatmap'
import PrayerCalendar from './PrayerCalendar'
import PrayerJourney from './PrayerJourney'
import WeeklyStats from './WeeklyStats'
import Achievements from './Achievements'
import CollapsibleCard from './CollapsibleCard'

export default function ProgressTab({ prayers, streak, history }) {
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
          <PrayerCalendar prayers={prayers} history={history} />
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
        <div className="space-y-3">
          <CollapsibleCard
            title={t('progress.prayer_journey')}
            icon="🕌"
            expanded={expandedCard === 'journey'}
            onToggle={() => toggleCard('journey')}
          >
            <PrayerJourney prayers={prayers} history={history} inline />
          </CollapsibleCard>

          <CollapsibleCard
            title={t('progress.weekly_stats')}
            icon="📊"
            expanded={expandedCard === 'weekly'}
            onToggle={() => toggleCard('weekly')}
          >
            <WeeklyStats prayers={prayers} history={history} inline />
          </CollapsibleCard>

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
