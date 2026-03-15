import { supabase } from './supabase'

export async function generateDua(topic, language = 'en') {
  const { data, error } = await supabase.functions.invoke('generate-dua', {
    body: { topic, language },
  })

  if (error) {
    throw new Error(error.message || 'Failed to generate Dua')
  }

  if (data?.error) {
    throw new Error(data.error)
  }

  return data?.duas || []
}
