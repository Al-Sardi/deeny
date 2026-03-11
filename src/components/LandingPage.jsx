import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Flame, Calendar, BookOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const features = [
  { titleKey: 'landing.prayer_tracking', descKey: 'landing.prayer_tracking_desc', Icon: CheckCircle2 },
  { titleKey: 'landing.streak_motivation', descKey: 'landing.streak_motivation_desc', Icon: Flame },
  { titleKey: 'landing.monthly_calendar', descKey: 'landing.monthly_calendar_desc', Icon: Calendar },
  { titleKey: 'landing.daily_ayah', descKey: 'landing.daily_ayah_desc', Icon: BookOpen },
]

export default function LandingPage() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-dvh flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
          <img src="/logo.png" alt="Deeny" className="mb-6 h-16 w-16 mx-auto" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100"
        >
          Deeny
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-3 max-w-xs text-lg text-zinc-500 dark:text-zinc-400"
        >
          {t('landing.tagline')}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-10 flex gap-3"
        >
          <Link
            to="/signup"
            className="rounded-xl bg-emerald-600 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.97]"
          >
            {t('landing.get_started')}
          </Link>
          <Link
            to="/login"
            className="rounded-xl border border-zinc-200 bg-white px-7 py-3 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 active:scale-[0.97] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {t('landing.login')}
          </Link>
        </motion.div>
      </section>

      {/* Features */}
      <section className="border-t border-zinc-200 bg-white px-6 py-20 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-10 text-center text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          {t('landing.everything_you_need')}
        </h2>
        <div className="mx-auto grid max-w-lg gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.titleKey}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-start gap-4 rounded-2xl border border-zinc-100 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-800/50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                <f.Icon size={20} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100">{t(f.titleKey)}</h3>
                <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{t(f.descKey)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t border-zinc-200 bg-white py-8 text-center text-xs text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500">
        {t('landing.footer')}
      </footer>
    </div>
  )
}
