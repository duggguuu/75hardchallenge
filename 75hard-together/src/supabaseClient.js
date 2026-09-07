import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const hasSupabase = Boolean(url && anonKey)

if (!hasSupabase) {
  console.error(
    'Supabase keys missing at build time. Set VITE_SUPABASE_URL and ' +
      'VITE_SUPABASE_ANON_KEY in Vercel (tick Production) and redeploy.',
  )
}

// Only build the client when keys exist, so a missing key shows the
// in-app setup screen instead of crashing to a blank page.
export const supabase = hasSupabase ? createClient(url, anonKey) : null