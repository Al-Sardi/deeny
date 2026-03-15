import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { topic, language = 'en' } = await req.json()

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Topic is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const normalizedTopic = topic.trim().toLowerCase()

    // Check cache first
    const { data: cached } = await supabase
      .from('dua_cache')
      .select('response')
      .eq('topic', normalizedTopic)
      .eq('language', language)
      .maybeSingle()

    if (cached?.response) {
      return new Response(JSON.stringify({ duas: cached.response }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Rate limit: max 20 requests per day per user
    const today = new Date().toISOString().split('T')[0]
    const { count } = await supabase
      .from('dua_requests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', `${today}T00:00:00`)

    if ((count ?? 0) >= 20) {
      return new Response(JSON.stringify({ error: 'Daily limit reached. Try again tomorrow.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const languageInstruction = language === 'de'
      ? 'Provide the translation in German.'
      : language === 'es'
        ? 'Provide the translation in Spanish.'
        : 'Provide the translation in English.'

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!anthropicKey) {
      return new Response(JSON.stringify({ error: 'AI service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: `You are an Islamic scholar assistant specializing in authentic Duas (supplications) from the Quran and Sunnah.

Given a topic or situation, return 2-3 authentic Duas that are relevant.

RULES:
- Only return well-known, authenticated Duas from the Quran or verified Hadith collections (Bukhari, Muslim, Tirmidhi, Abu Dawud, An-Nasa'i, Ibn Majah)
- Never fabricate or paraphrase Duas — return exact, commonly-cited versions
- If no authentic Dua exists for the exact topic, return the closest relevant Duas and note the context
- ${languageInstruction}

Return ONLY valid JSON — no markdown, no code fences, no explanation. Format:
[
  {
    "arabic": "Arabic text with diacritics",
    "transliteration": "Romanized pronunciation",
    "translation": "Translation in the requested language",
    "source": "Exact reference (e.g., Quran 2:201 or Sahih Muslim 2722)",
    "context": "One sentence explaining when/why to recite this Dua"
  }
]`,
        messages: [
          { role: 'user', content: `Find authentic Duas for: ${topic}` }
        ],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Anthropic API error:', errText)
      return new Response(JSON.stringify({ error: 'AI service error' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const aiResult = await response.json()
    const content = aiResult.content?.[0]?.text || '[]'

    let duas
    try {
      duas = JSON.parse(content)
    } catch {
      console.error('Failed to parse AI response:', content)
      return new Response(JSON.stringify({ error: 'Invalid AI response' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Cache the result
    await supabase.from('dua_cache').insert({
      topic: normalizedTopic,
      language,
      response: duas,
    })

    // Log the request for rate limiting
    await supabase.from('dua_requests').insert({
      user_id: user.id,
      topic: normalizedTopic,
    })

    return new Response(JSON.stringify({ duas }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Edge function error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
