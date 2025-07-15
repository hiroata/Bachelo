import { createServerComponentClient, createRouteHandlerClient as createSupabaseRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export const createServerClient = () => {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}

export const createRouteHandlerClient = () => {
  const cookieStore = cookies()
  return createSupabaseRouteHandlerClient<Database>({ cookies: () => cookieStore })
}

// Alias for backward compatibility
export const createClient = createRouteHandlerClient