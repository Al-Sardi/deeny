import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LandingPage from './components/LandingPage'
import Login from './components/Login'
import Signup from './components/Signup'
import ProtectedRoute from './components/ProtectedRoute'
import App from './App'

/**
 * AppRouter — defines all routes.
 * Landing, login, and signup are public.
 * /app is protected and requires authentication.
 */
export default function AppRouter() {
  const { user, loading } = useAuth()

  // While checking auth state, show nothing (prevents flash)
  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes — redirect to /app if already logged in */}
      <Route
        path="/"
        element={user ? <Navigate to="/app" replace /> : <LandingPage />}
      />
      <Route
        path="/login"
        element={user ? <Navigate to="/app" replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to="/app" replace /> : <Signup />}
      />

      {/* Protected dashboard */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <App />
          </ProtectedRoute>
        }
      />

      {/* Fallback — send unknown routes to landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
