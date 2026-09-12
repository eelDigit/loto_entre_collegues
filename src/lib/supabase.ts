import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase n\'est pas configuré. Renseignez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans votre fichier .env'
  )
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '')

export const TICKETS_BUCKET = 'tickets'
