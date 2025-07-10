import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import CreatorCard from '@/components/creator/CreatorCard'
import { Database } from '@/types/database'

async function getCreators() {
  // まずはSupabaseから取得を試みる
  try {
    const supabase = createServerComponentClient<Database>({ cookies })
    const { data: creators, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'creator')
      .eq('is_accepting_orders', true)
      .order('created_at', { ascending: false })
    
    if (!error && creators && creators.length > 0) {
      return creators
    }
  } catch (error) {
    console.log('Supabase error, falling back to mock data')
  }
  
  // Supabaseが利用できない場合はモックデータを使用
  // 直接モックデータを返す（Server Componentではlocalhost fetchが問題になることがある）
  return [
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      username: 'sweetvoice_aoi',
      display_name: 'あおい',
      avatar_url: null,
      bio: '優しい声で癒しをお届けします。甘い囁きが得意です。',
      role: 'creator',
      price_per_10sec: 1500,
      sample_voice_url: null,
      tags: ['癒し系', '囁き', 'ロリボイス'],
      is_accepting_orders: true,
      average_delivery_hours: 24,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '223e4567-e89b-12d3-a456-426614174001',
      username: 'mature_voice_yui',
      display_name: 'ゆい',
      avatar_url: null,
      bio: '大人の魅力を声でお届け。お姉さんボイスならお任せください。',
      role: 'creator',
      price_per_10sec: 2000,
      sample_voice_url: null,
      tags: ['お姉さん', 'セクシー', '大人'],
      is_accepting_orders: true,
      average_delivery_hours: 48,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '323e4567-e89b-12d3-a456-426614174002',
      username: 'moe_voice_sakura',
      display_name: 'さくら',
      avatar_url: null,
      bio: '元気いっぱいの萌えボイスでお客様を楽しませます！',
      role: 'creator',
      price_per_10sec: 1200,
      sample_voice_url: null,
      tags: ['萌え', '元気', 'ツンデレ'],
      is_accepting_orders: false,
      average_delivery_hours: 36,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
}

export default async function CreatorsPage() {
  const creators = await getCreators()
  
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