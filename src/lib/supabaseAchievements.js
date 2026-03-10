/**
 * supabaseAchievements.js — CRUD helpers for the `achievements` table.
 *
 * Achievements are append-only: once unlocked they are never deleted.
 * Aggregate stats (totalPrayers, perfectDays, bestStreak) are computed
 * from the `prayers` table on demand instead of being stored separately.
 */
import { supabase } from './supabase'

/** Fetch all unlocked achievement IDs for a user. */
export async function fetchUnlockedAchievements(userId) {
  const { data, error } = await supabase
    .from('achievements')
    .select('achievement_id')
    .eq('user_id', userId)

  if (error) return { data: [], error }
  return { data: data.map((r) => r.achievement_id), error: null }
}

/**
 * Batch-insert newly unlocked achievements.
 * The UNIQUE(user_id, achievement_id) constraint + ignoreDuplicates
 * makes this safe to call multiple times with the same IDs.
 */
export async function insertAchievements(userId, achievementIds) {
  if (!achievementIds || achievementIds.length === 0) return { error: null }

  const rows = achievementIds.map((aid) => ({
    user_id: userId,
    achievement_id: aid,
  }))

  const { error } = await supabase
    .from('achievements')
    .upsert(rows, { onConflict: 'user_id,achievement_id', ignoreDuplicates: true })
  return { error }
}

/**
 * Compute aggregate prayer stats from the `prayers` table.
 * Returns { totalPrayers, perfectDays, bestStreak }.
 */
export async function fetchPrayerStats(userId) {
  const { data, error } = await supabase
    .from('prayers')
    .select('fajr, dhuhr, asr, maghrib, isha, streak')
    .eq('user_id', userId)

  if (error || !data) return { stats: null, error }

  let totalPrayers = 0
  let perfectDays = 0
  let bestStreak = 0

  data.forEach((row) => {
    const completed = [row.fajr, row.dhuhr, row.asr, row.maghrib, row.isha]
      .filter(Boolean).length
    totalPrayers += completed
    if (completed === 5) perfectDays++
    if (row.streak > bestStreak) bestStreak = row.streak
  })

  return { stats: { totalPrayers, perfectDays, bestStreak }, error: null }
}

/**
 * Fetch the user's tasbih total (for tasbih achievement check).
 * This avoids importing the full tasbih helper in StreaksTab.
 */
export async function fetchTasbihTotal(userId) {
  const { data, error } = await supabase
    .from('tasbih_data')
    .select('total')
    .eq('user_id', userId)
    .maybeSingle()

  return { total: data?.total ?? 0, error }
}
