import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: err } = await signIn(email, password)

    if (err) {
      setError(err.message)
      setLoading(false)
    } else {
      navigate('/app')
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-zinc-50 px-5 dark:bg-zinc-950">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-10 flex flex-col items-center gap-2">
          <img src="/logo.svg" alt="Deeny" className="h-12 w-12" />
          <span className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Deeny</span>
        </Link>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-5 text-center text-base font-medium text-zinc-900 dark:text-zinc-100">
            Welcome back
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
                placeholder="Your password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
