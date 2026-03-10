import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Flame, Calendar, BookOpen } from 'lucide-react'

const features = [
  { title: 'Prayer Tracking', desc: 'Track all five daily prayers with a single tap.', Icon: CheckCircle2 },
  { title: 'Streak Motivation', desc: 'Build consistency with daily streaks and achievements.', Icon: Flame },
  { title: 'Monthly Calendar', desc: 'Visualise your prayer history in a color-coded calendar.', Icon: Calendar },
  { title: 'Daily Ayah', desc: 'Start each day with a verse from the Quran.', Icon: BookOpen },
]

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
          <img src="/logo.png" alt="Deeny" className="mb-6 h-20 w-20 mx-auto" />
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
          Build your Deen one prayer at a time.
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
            Get Started
          </Link>
          <Link
            to="/login"
            className="rounded-xl border border-zinc-200 bg-white px-7 py-3 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 active:scale-[0.97] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Login
          </Link>
        </motion.div>
      </section>

      {/* Features */}
      <section className="border-t border-zinc-200 bg-white px-6 py-20 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-10 text-center text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Everything you need
        </h2>
        <div className="mx-auto grid max-w-lg gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
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
                <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100">{f.title}</h3>
                <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t border-zinc-200 bg-white py-8 text-center text-xs text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500">
        Deeny &mdash; Your daily companion for Salah.
      </footer>
    </div>
  )
}
