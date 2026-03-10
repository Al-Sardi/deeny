/**
 * supabasePrayers.js — CRUD helpers for the `prayers` table.
 *
 * Each day has one row per user. The UNIQUE(user_id, date) constraint
 * lets us use upsert for both create and update operations.
 */
import { supabase } from './supabase'

// ── Column ↔ React key mapping ───────────────────────────

/** Convert a Supabase row to the capitalised React prayer state. */
export function rowToPrayers(row) {
  return {
    Fajr: row.fajr,
    Dhuhr: row.dhuhr,
    Asr: row.asr,
    Maghrib: row.maghrib,
    Isha: row.isha,
  }
}

/** Convert DB rows → history format: [{ date, prayers }, ...] */
export function rowsToHistory(rows) {
  return rows.map((row) => ({
    date: row.date,
    prayers: rowToPrayers(row),
  }))
}

// ── Queries ──────────────────────────────────────────────

/** Fetch today's prayer row (or null if none exists). */
export async function fetchTodayPrayers(userId, todayStr) {
  const { data, error } = await supabase
    .from('prayers')
    .select('*')
    .eq('user_id', userId)
    .eq('date', todayStr)
    .maybeSingle()
  return { data, error }
}

/** Fetch yesterday's row for streak continuation check. */
export async function fetchYesterdayPrayers(userId, yesterdayStr) {
  const { data, error } = await supabase
    .from('prayers')
    .select('fajr, dhuhr, asr, maghrib, isha, streak')
    .eq('user_id', userId)
    .eq('date', yesterdayStr)
    .maybeSingle()
  return { data, error }
}

/** Fetch past prayer rows for calendar + weekly stats (excludes today). */
export async function fetchPrayerHistory(userId, todayStr, limit = 90) {
  const { data, error } = await supabase
    .from('prayers')
    .select('date, fajr, dhuhr, asr, maghrib, isha, streak')
    .eq('user_id', userId)
    .lt('date', todayStr)
    .order('date', { ascending: false })
    .limit(limit)
  return { data, error }
}

// ── Mutations ────────────────────────────────────────────

/** Create or update today's prayer row (debounce target). */
export async function upsertTodayPrayers(userId, todayStr, prayers, streak) {
  const { error } = await supabase
    .from('prayers')
    .upsert(
      {
        user_id: userId,
        date: todayStr,
        fajr: prayers.Fajr,
        dhuhr: prayers.Dhuhr,
        asr: prayers.Asr,
        maghrib: prayers.Maghrib,
        isha: prayers.Isha,
        streak,
      },
      { onConflict: 'user_id,date' }
    )
  return { error }
}

/** Bulk-insert history rows (used for one-time localStorage migration). */
export async function bulkInsertHistory(userId, historyArray) {
  if (!historyArray || historyArray.length === 0) return { error: null }

  const rows = historyArray.map((day) => ({
    user_id: userId,
    date: day.date,
    fajr: day.prayers.Fajr ?? false,
    dhuhr: day.prayers.Dhuhr ?? false,
    asr: day.prayers.Asr ?? false,
    maghrib: day.prayers.Maghrib ?? false,
    isha: day.prayers.Isha ?? false,
    streak: 0, // historical rows don't have streak data
  }))

  const { error } = await supabase
    .from('prayers')
    .upsert(rows, { onConflict: 'user_id,date' })
  return { error }
}
