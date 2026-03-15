import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Compass, CircleDot, BookOpenText, Star, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import QiblaFinder from './QiblaFinder'
import TasbihCounter from './TasbihCounter'
import DhikrLibrary from './DhikrLibrary'
import NamesOfAllah from './NamesOfAllah'

const tools = [
  { id: 'qibla', labelKey: 'tools.qibla', Icon: Compass, color: 'bg-blue-50 dark:bg-blue-900/20', iconColor: 'text-blue-500' },
  { id: 'tasbih', labelKey: 'tools.tasbih', Icon: CircleDot, color: 'bg-purple-50 dark:bg-purple-900/20', iconColor: 'text-purple-500' },
  { id: 'dhikr', labelKey: 'tools.dhikr', Icon: BookOpenText, color: 'bg-amber-50 dark:bg-amber-900/20', iconColor: 'text-amber-500' },
  { id: 'names', labelKey: 'tools.names', Icon: Star, color: 'bg-emerald-50 dark:bg-emerald-900/20', iconColor: 'text-emerald-500' },
]

export default function QuickTools() {
  const { t } = useTranslation()
  const [activeTool, setActiveTool] = useState(null)

  return (
    <>
      {/* 2x2 Grid tiles */}
      <div className="grid grid-cols-2 gap-3">
        {tools.map(({ id, labelKey, Icon, color, iconColor }, i) => (
          <motion.button
            key={id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: i * 0.05 }}
            onClick={() => setActiveTool(id)}
            className={`flex flex-col items-center gap-1.5 rounded-2xl ${color} px-4 py-3 transition-transform active:scale-95`}
          >
            <Icon size={20} className={iconColor} strokeWidth={1.5} />
            <span className="whitespace-nowrap text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
              {t(labelKey)}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Full-screen overlay when a tool is active */}
      <AnimatePresence>
        {activeTool && (
          <motion.div
            key="tool-overlay"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 z-[60] flex flex-col bg-zinc-50 dark:bg-zinc-950"
          >
            {/* Close bar — padded below iPhone status bar / notch */}
            <div className="flex items-center justify-between px-5 pb-2" style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 1rem)' }}>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {t(`tools.${activeTool}`)}
              </h2>
              <button
                onClick={() => setActiveTool(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
              >
                <X size={16} className="text-zinc-500 dark:text-zinc-400" strokeWidth={2} />
              </button>
            </div>

            {/* Tool content */}
            <div className="flex-1 overflow-y-auto px-5 pb-8">
              {activeTool === 'qibla' && <QiblaFinder />}
              {activeTool === 'tasbih' && <TasbihCounter />}
              {activeTool === 'dhikr' && <DhikrLibrary onBack={() => setActiveTool(null)} />}
              {activeTool === 'names' && <NamesOfAllah />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
