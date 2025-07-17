import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'

export const createClient = () => {
  // Check if we're in build process and provide fallback
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
    // Return mock client during build
    return {
      auth: { getSession: () => Promise.resolve({ data: { session: null }, error: null }) },
      from: () => ({ select: () => ({ data: [], error: null }), insert: () => ({ data: [], error: null }), update: () => ({ data: [], error: null }), delete: () => ({ data: [], error: null }) }),
      storage: { from: () => ({ list: () => Promise.resolve({ data: [], error: null }) }) },
      channel: () => ({ on: () => ({}), subscribe: () => ({}) })
    } as any
  }
  
  return createClientComponentClient<Database>()
}