import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export const createServerClient = () => {
  const cookieStore = cookies()
<<<<<<< HEAD
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
=======
  
  // 環境変数が設定されているか確認
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
    options: {
      global: {
        headers: {
          'x-application-name': 'voice-eros'
        }
      }
    }
  })
>>>>>>> 446ee5bdb9362137b7929f741efde0add2fde644
}