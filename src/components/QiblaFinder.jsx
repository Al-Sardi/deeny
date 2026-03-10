import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Compass, Navigation, MapPin, AlertCircle } from 'lucide-react'

const KAABA_LAT = 21.4225
const KAABA_LNG = 39.8262

function toRad(deg) {
  return (deg * Math.PI) / 180
}

function toDeg(rad) {
  return (rad * 180) / Math.PI
}

/** Calculate the bearing from (lat1, lng1) to (lat2, lng2) in degrees. */
function calculateBearing(lat1, lng1, lat2, lng2) {
  const dLng = toRad(lng2 - lng1)
  const y = Math.sin(dLng) * Math.cos(toRad(lat2))
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng)
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}

/** Calculate the distance in km between two points using the Haversine formula. */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function QiblaFinder() {
  const [location, setLocation] = useState(null)
  const [locationError, setLocationError] = useState(null)
  const [heading, setHeading] = useState(null) // device compass heading
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [locating, setLocating] = useState(false)
  const headingRef = useRef(null)

  // Qibla bearing from user location
  const qiblaBearing = location
    ? calculateBearing(location.lat, location.lng, KAABA_LAT, KAABA_LNG)
    : null

  const distance = location
    ? calculateDistance(location.lat, location.lng, KAABA_LAT, KAABA_LNG)
    : null

  // Rotation for the arrow: qibla bearing minus current device heading
  const arrowRotation =
    qiblaBearing !== null && heading !== null
      ? (qiblaBearing - heading + 360) % 360
      : null

  // ── Request geolocation ─────────────────────────────
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.')
      return
    }

    setLocating(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      (err) => {
        if (err.code === 1) {
          setPermissionDenied(true)
          setLocationError('Location access denied. Please enable location permissions.')
        } else {
          setLocationError('Unable to determine your location. Please try again.')
        }
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  // Auto-request location on mount
  useEffect(() => {
    requestLocation()
  }, [requestLocation])

  // ── Device orientation for compass ──────────────────
  useEffect(() => {
    function handleOrientation(e) {
      // webkitCompassHeading is available on iOS Safari
      if (e.webkitCompassHeading !== undefined) {
        headingRef.current = e.webkitCompassHeading
      } else if (e.alpha !== null) {
        // Android / standard — alpha is degrees from north
        headingRef.current = (360 - e.alpha) % 360
      }
      setHeading(headingRef.current)
    }

    // iOS 13+ requires permission request
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then((state) => {
          if (state === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation, true)
          }
        })
        .catch(() => {})
    } else {
      window.addEventListener('deviceorientation', handleOrientation, true)
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true)
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Compass card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {/* Status row */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass size={16} className="text-emerald-500" strokeWidth={1.5} />
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Qibla Direction</span>
          </div>
          {qiblaBearing !== null && (
            <span className="text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
              {Math.round(qiblaBearing)}° from North
            </span>
          )}
        </div>

        {/* Compass visual */}
        <div className="flex flex-col items-center">
          {locationError ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <AlertCircle size={24} className="text-zinc-300 dark:text-zinc-600" strokeWidth={1.5} />
              <p className="max-w-[240px] text-center text-sm text-zinc-500 dark:text-zinc-400">
                {locationError}
              </p>
              {!permissionDenied && (
                <button
                  onClick={requestLocation}
                  className="mt-1 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 active:scale-[0.97]"
                >
                  Try again
                </button>
              )}
            </div>
          ) : locating ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              <span className="text-sm text-zinc-400 dark:text-zinc-500">Finding your location…</span>
            </div>
          ) : (
            <>
              {/* Compass ring */}
              <div className="relative flex h-56 w-56 items-center justify-center">
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border-2 border-zinc-100 dark:border-zinc-800" />

                {/* Cardinal directions — rotate with device heading */}
                <motion.div
                  className="absolute inset-0"
                  animate={{ rotate: heading !== null ? -heading : 0 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                >
                  <span className="absolute left-1/2 top-2 -translate-x-1/2 text-xs font-semibold text-zinc-900 dark:text-zinc-100">N</span>
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-400 dark:text-zinc-500">E</span>
                  <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-medium text-zinc-400 dark:text-zinc-500">S</span>
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-400 dark:text-zinc-500">W</span>
                </motion.div>

                {/* Qibla arrow */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ rotate: arrowRotation ?? (qiblaBearing ?? 0) }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                >
                  <div className="flex h-full flex-col items-center pt-5">
                    <Navigation
                      size={24}
                      className="text-emerald-500 drop-shadow-sm"
                      strokeWidth={2}
                      fill="currentColor"
                    />
                  </div>
                </motion.div>

                {/* Kaaba icon center */}
                <div className="z-10 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-50 shadow-sm dark:bg-zinc-800">
                  <span className="text-2xl">🕋</span>
                </div>
              </div>

              {/* Heading info */}
              <div className="mt-5 text-center">
                {heading !== null ? (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Point your phone towards{' '}
                    <span className="font-medium text-emerald-600 tabular-nums dark:text-emerald-400">
                      {Math.round(qiblaBearing)}°
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-zinc-400 dark:text-zinc-500">
                    Rotate your phone to activate the compass
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Distance card */}
      {distance !== null && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex items-center gap-3">
            <MapPin size={16} className="text-zinc-400 dark:text-zinc-500" strokeWidth={1.5} />
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Distance to Kaaba</p>
              <p className="text-lg font-semibold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-100">
                {distance < 10
                  ? `${distance.toFixed(1)} km`
                  : `${Math.round(distance).toLocaleString()} km`}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
