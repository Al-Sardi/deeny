import { useState } from 'react'
import { motion } from 'framer-motion'
import { Compass, CircleDot, BookOpenText, Star, BookOpen, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import QiblaFinder from './QiblaFinder'
import TasbihCounter from './TasbihCounter'
import DhikrLibrary from './DhikrLibrary'
import NamesOfAllah from './NamesOfAllah'
import QuranReader from './QuranReader'

const tools = [
  { id: 'quran', labelKey: 'tools.quran', descKey: 'tools.quran_desc', Icon: BookOpen },
  { id: 'qibla', labelKey: 'tools.qibla', descKey: 'tools.qibla_desc', Icon: Compass },
  { id: 'tasbih', labelKey: 'tools.tasbih', descKey: 'tools.tasbih_desc', Icon: CircleDot },
  { id: 'dhikr', labelKey: 'tools.dhikr', descKey: 'tools.dhikr_desc', Icon: BookOpenText },
  { id: 'names', labelKey: 'tools.names', descKey: 'tools.names_desc', Icon: Star },
]

function BackButton({ onClick, t }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-sm font-medium text-emerald-600 transition hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
    >
      <ChevronRight size={16} className="rotate-180" strokeWidth={2} />
      {t('tools.back')}
    </button>
  )
}

export default function ToolsTab() {
  const { t } = useTranslation()
  const [activeTool, setActiveTool] = useState(null)

  if (activeTool === 'quran') {
    return <QuranReader onBack={() => setActiveTool(null)} />
  }

  if (activeTool === 'qibla') {
    return (
      <div className="space-y-4">
        <BackButton onClick={() => setActiveTool(null)} t={t} />
        <QiblaFinder />
      </div>
    )
  }

  if (activeTool === 'tasbih') {
    return (
      <div className="space-y-4">
        <BackButton onClick={() => setActiveTool(null)} t={t} />
        <TasbihCounter />
      </div>
    )
  }

  if (activeTool === 'dhikr') {
    return <DhikrLibrary onBack={() => setActiveTool(null)} />
  }

  if (activeTool === 'names') {
    return (
      <div className="space-y-4">
        <BackButton onClick={() => setActiveTool(null)} t={t} />
        <NamesOfAllah />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tools.map(({ id, labelKey, descKey, Icon }, i) => (
        <motion.button
          key={id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: i * 0.06 }}
          onClick={() => setActiveTool(id)}
          className="flex w-full items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
            <Icon size={20} className="text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
          </div>
          <div className="flex-1 text-left">
            <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">{t(labelKey)}</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{t(descKey)}</p>
          </div>
          <ChevronRight size={18} className="text-zinc-300 dark:text-zinc-600" strokeWidth={1.5} />
        </motion.button>
      ))}
    </div>
  )
}
