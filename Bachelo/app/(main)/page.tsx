import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import CreatorCard from '@/components/creator/CreatorCard'
import { Database } from '@/types/database'

export default async function HomePage() {
  const supabase = createServerComponentClient<Database>({ cookies })
  
  // アクティブなクリエイターを取得
  const { data: creators } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'creator')
    .eq('is_accepting_orders', true)
    .order('created_at', { ascending: false })
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">BACHELO</h1>
          <p className="mt-2 text-gray-600">プロフェッショナルなアダルトボイスクリエイター</p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {creators && creators.length > 0 ? (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">クリエイター一覧</h2>
              <p className="text-sm text-gray-500">{creators.length}名のクリエイター</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {creators.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">現在、登録されているクリエイターはいません</p>
          </div>
        )}
      </main>
    </div>
  )
}