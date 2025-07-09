import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Database } from '@/types/database'
import { Button } from '@/components/ui/Button'
import { Clock, Star, ShoppingCart } from 'lucide-react'

interface PageProps {
  params: {
    id: string
  }
}

export default async function CreatorDetailPage({ params }: PageProps) {
  const supabase = createServerComponentClient<Database>({ cookies })
  
  // クリエイター情報を取得
  const { data: creator } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .eq('role', 'creator')
    .single()
  
  if (!creator) {
    notFound()
  }
  
  // クリエイターの投稿を取得
  const { data: recentPosts } = await supabase
    .from('voice_posts')
    .select('*')
    .eq('creator_id', creator.id)
    .order('created_at', { ascending: false })
    .limit(3)
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* クリエイター情報ヘッダー */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-start space-x-4 mb-4 md:mb-0">
              {creator.avatar_url ? (
                <img
                  src={creator.avatar_url}
                  alt={creator.display_name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white text-3xl font-bold">
                  {creator.display_name[0]}
                </div>
              )}
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {creator.display_name}
                </h1>
                <p className="text-gray-500">@{creator.username}</p>
                
                {creator.bio && (
                  <p className="mt-2 text-gray-700 max-w-2xl">
                    {creator.bio}
                  </p>
                )}
                
                {creator.tags && creator.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {creator.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="inline-block px-3 py-1 text-sm bg-pink-100 text-pink-700 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <div className="mb-4">
                <div className="text-3xl font-bold text-pink-500">
                  ¥{creator.price_per_10sec?.toLocaleString() || '---'}
                </div>
                <div className="text-sm text-gray-500">10秒あたり</div>
              </div>
              
              {creator.is_accepting_orders ? (
                <Link href={`/order/${creator.id}`}>
                  <Button size="lg" className="w-full md:w-auto">
                    <ShoppingCart className="mr-2" size={20} />
                    オーダーする
                  </Button>
                </Link>
              ) : (
                <Button size="lg" disabled className="w-full md:w-auto">
                  受付停止中
                </Button>
              )}
              
              {creator.average_delivery_hours && (
                <div className="mt-2 flex items-center justify-center md:justify-end text-sm text-gray-500">
                  <Clock size={16} className="mr-1" />
                  平均納期: {creator.average_delivery_hours}時間
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* サンプルボイス */}
        {creator.sample_voice_url && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">サンプルボイス</h2>
            <audio controls className="w-full" src={creator.sample_voice_url}>
              お使いのブラウザは音声再生に対応していません
            </audio>
          </div>
        )}
        
        {/* 最近の投稿 */}
        {recentPosts && recentPosts.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">最近の投稿</h2>
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div key={post.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">{post.title}</h3>
                  {post.description && (
                    <p className="text-sm text-gray-600 mb-2">{post.description}</p>
                  )}
                  <audio controls className="w-full" src={post.audio_url}>
                    お使いのブラウザは音声再生に対応していません
                  </audio>
                  <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                    <span>{post.play_count}回再生</span>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}