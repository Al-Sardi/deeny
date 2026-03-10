import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Moon, LogOut, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function SettingsTab({ dark, onToggleTheme }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    await signOut()
    navigate('/login')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* Account */}
      <section>
        <h2 className="mb-2 px-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">Account</h2>
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {/* Email row */}
          <div className="flex items-center gap-3 border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
            <Mail size={16} className="text-zinc-400 dark:text-zinc-500" strokeWidth={1.5} />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Email</p>
              <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {user?.email ?? 'Not signed in'}
              </p>
            </div>
          </div>

          {/* Logout row */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 px-5 py-4 transition-colors hover:bg-zinc-50 active:bg-zinc-100 disabled:opacity-50 dark:hover:bg-zinc-800/50 dark:active:bg-zinc-800"
          >
            <LogOut size={16} className="text-red-500" strokeWidth={1.5} />
            <span className="flex-1 text-left text-sm font-medium text-red-600 dark:text-red-400">
              {loggingOut ? 'Signing out…' : 'Sign out'}
            </span>
            <ChevronRight size={14} className="text-zinc-300 dark:text-zinc-700" />
          </button>
        </div>
      </section>

      {/* Preferences */}
      <section>
        <h2 className="mb-2 px-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">Preferences</h2>
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3 px-5 py-4">
            <Moon size={16} className="text-zinc-400 dark:text-zinc-500" strokeWidth={1.5} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Dark mode</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                {dark ? 'On' : 'Off'}
              </p>
            </div>
            <button
              onClick={onToggleTheme}
              role="switch"
              aria-checked={dark}
              className={`relative inline-flex h-[26px] w-[44px] shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200
                ${dark ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}
            >
              <motion.span
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={`inline-block h-[20px] w-[20px] rounded-full bg-white shadow-sm
                  ${dark ? 'ml-[21px]' : 'ml-[3px]'}`}
              />
            </button>
          </div>
        </div>
      </section>
    </motion.div>
  )
}
