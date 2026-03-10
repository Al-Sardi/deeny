import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      setLoading(false)
      return
    }

    if (!isSupabaseConfigured) {
      setError('Backend is not configured. Please set the Supabase environment variables.')
      setLoading(false)
      return
    }

    try {
      const { data, error: err } = await signUp(email, password)

      if (err) {
        setError(err.message)
        setLoading(false)
      } else if (data?.user?.identities?.length === 0) {
        setError('An account with this email already exists.')
        setLoading(false)
      } else {
        if (data?.session) {
          navigate('/app')
        } else {
          setSuccess(true)
          setLoading(false)
        }
      }
    } catch {
      setError('Unable to connect to the server. Please check your connection and try again.')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-50 px-5 dark:bg-zinc-950">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
            <Check size={28} className="text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Check your email</h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            We sent a confirmation link to <strong className="text-zinc-700 dark:text-zinc-200">{email}</strong>.
          </p>
          <Link
            to="/login"
            className="mt-8 inline-block rounded-xl bg-emerald-600 px-7 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            Go to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-zinc-50 px-5 dark:bg-zinc-950">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-10 flex flex-col items-center gap-2">
          <img src="/logo.png" alt="Deeny" className="h-12 w-12" />
          <span className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Deeny</span>
        </Link>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-5 text-center text-base font-medium text-zinc-900 dark:text-zinc-100">
            Create your account
          </h2>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm text-zinc-600 dark:text-zinc-400">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-zinc-600 dark:text-zinc-400">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                placeholder="Min. 6 characters"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Creating account…' : 'Sign up'}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
