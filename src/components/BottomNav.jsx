import { Home, BarChart3, Wrench, Settings } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const tabs = [
  { id: 'prayers', labelKey: 'nav.home', Icon: Home },
  { id: 'progress', labelKey: 'nav.progress', Icon: BarChart3 },
  { id: 'tools', labelKey: 'nav.tools', Icon: Wrench },
  { id: 'settings', labelKey: 'nav.settings', Icon: Settings },
]

export default function BottomNav({ activeTab, onChangeTab }) {
  const { t } = useTranslation()

  return (
    <nav className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-zinc-50 via-zinc-50/80 to-transparent px-5 pb-5 pt-8 dark:from-zinc-950 dark:via-zinc-950/80">
      <div className="pointer-events-auto mx-auto max-w-md rounded-2xl border border-zinc-200/70 bg-white shadow-lg shadow-zinc-900/5 dark:border-zinc-800/70 dark:bg-zinc-900 dark:shadow-black/20">
        <div className="flex items-center">
          {tabs.map(({ id, labelKey, Icon }) => {
            const active = activeTab === id
            return (
              <button
                key={id}
                onClick={() => onChangeTab(id)}
                className="relative flex flex-1 flex-col items-center gap-1 py-3 transition-colors"
              >
                <Icon
                  size={20}
                  strokeWidth={active ? 2 : 1.5}
                  className={`transition-colors duration-150 ${
                    active
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-zinc-400 dark:text-zinc-500'
                  }`}
                />
                <span className={`text-[10px] font-medium transition-colors duration-150 ${
                  active
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-zinc-400 dark:text-zinc-500'
                }`}>
                  {t(labelKey)}
                </span>
                {active && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute -top-px left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-emerald-500"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
