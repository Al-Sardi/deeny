/**
 * supabaseTasbih.js — CRUD helpers for the `tasbih_data` table.
 *
 * One row per user (UNIQUE on user_id). Stores the running
 * counter state: current count, target, and lifetime total.
 */
import { supabase } from './supabase'

/** Fetch the user's tasbih data (or null if no row exists). */
export async function fetchTasbih(userId) {
  const { data, error } = await supabase
    .from('tasbih_data')
    .select('count, target, total')
    .eq('user_id', userId)
    .maybeSingle()
  return { data, error }
}

/** Create or update the user's tasbih row. */
export async function upsertTasbih(userId, { count, target, total }) {
  const { error } = await supabase
    .from('tasbih_data')
    .upsert(
      {
        user_id: userId,
        count,
        target,
        total,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
  return { error }
}
