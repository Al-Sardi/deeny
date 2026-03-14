/**
 * supabaseReflections.js — CRUD helpers for the `reflections` table.
 */
import { supabase } from './supabase'

/** Fetch all reflections for a user, newest first. */
export async function fetchReflections(userId) {
  const { data, error } = await supabase
    .from('reflections')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return { data: data ?? [], error }
}

/** Create a new reflection. */
export async function createReflection(userId, reflection) {
  const { data, error } = await supabase
    .from('reflections')
    .insert({
      user_id: userId,
      text: reflection.text,
      surah_number: reflection.surahNumber || null,
      ayah_number: reflection.ayahNumber || null,
      reference_str: reflection.referenceString || null,
      category: reflection.category || null,
    })
    .select()
    .single()

  return { data, error }
}

/** Update an existing reflection. */
export async function updateReflection(id, updates) {
  const { data, error } = await supabase
    .from('reflections')
    .update({
      text: updates.text,
      surah_number: updates.surahNumber || null,
      ayah_number: updates.ayahNumber || null,
      reference_str: updates.referenceString || null,
      category: updates.category || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

/** Delete a reflection by ID. */
export async function deleteReflection(id) {
  const { error } = await supabase
    .from('reflections')
    .delete()
    .eq('id', id)

  return { error }
}

/** Count total reflections for a user (for achievements). */
export async function countReflections(userId) {
  const { count, error } = await supabase
    .from('reflections')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  return { count: count ?? 0, error }
}
