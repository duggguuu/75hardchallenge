import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// A tiny, friendly heads-up in the console if the keys are missing.
if (!url || !anonKey) {
  console.error(
    'Supabase keys are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY ' +
      'to a .env file (local) and to your Vercel project settings (deployed).',
  )
}

export const supabase = createClient(url, anonKey)
export const hasSupabase = Boolean(url && anonKey)
