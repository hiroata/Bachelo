'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'
import VoicePostCard from '@/components/timeline/VoicePostCard'
import PostVoiceModal from '@/components/timeline/PostVoiceModal'
import { Button } from '@/components/ui/Button'
import { Mic, Filter } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

type VoicePost = Database['public']['Tables']['voice_posts']['Row'] & {
  creator: Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'username' | 'display_name' | 'avatar_url'>
  likes: { count: number }[]
  comments: { count: number }[]
}

export default function TimelinePage() {
  const [posts, setPosts] = useState<VoicePost[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'latest' | 'popular' | 'following'>('latest')
  const [showPostModal, setShowPostModal] = useState(false)
  const supabase = createClientComponentClient<Database>()
  const { profile } = useAuth()
  
  const isCreator = profile?.role === 'creator'
  
  useEffect(() => {
    loadPosts()
    
    // リアルタイム更新を設定
    const channel = supabase
      .channel('timeline')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'voice_posts'
      }, async (payload) => {
        // 新しい投稿を取得
        const { data } = await supabase
          .from('voice_posts')
          .select(`
            *,
            creator:profiles!creator_id(
              id, username, display_name, avatar_url
            ),
            likes:post_likes(count),
            comments:post_comments(count)
          `)
          .eq('id', payload.new.id)
          .single()
        
        if (data) {
          setPosts(prev => [data, ...prev])
        }
      })
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [filter])
  
  const loadPosts = async () => {
    setLoading(true)
    
    try {
      let query = supabase
        .from('voice_posts')
        .select(`
          *,
          creator:profiles!creator_id(
            id, username, display_name, avatar_url
          ),
          likes:post_likes(count),
          comments:post_comments(count)
        `)
      
      // フィルタリング
      if (filter === 'popular') {
        query = query.order('play_count', { ascending: false })
      } else if (filter === 'following' && profile) {
        // フォロー中のクリエイターの投稿を取得
        const { data: follows } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', profile.id)
        
        if (follows && follows.length > 0) {
          const followingIds = follows.map(f => f.following_id)
          query = query.in('creator_id', followingIds)
        }
        query = query.order('created_at', { ascending: false })
      } else {
        query = query.order('created_at', { ascending: false })
      }
      
      const { data, error } = await query.limit(50)
      
      if (error) throw error
      
      setPosts(data || [])
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">音声タイムライン</h1>
          {isCreator && (
            <Button onClick={() => setShowPostModal(true)}>
              <Mic className="mr-2" size={20} />
              投稿する
            </Button>
          )}
        </div>
        
        {/* フィルタータブ */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            {(['latest', 'popular', 'following'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                  filter === tab 
                    ? 'text-pink-500 border-b-2 border-pink-500' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'latest' ? '新着' : tab === 'popular' ? '人気' : 'フォロー中'}
              </button>
            ))}
          </div>
        </div>
        
        {/* 投稿一覧 */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <VoicePostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">
              {filter === 'following' 
                ? 'フォロー中のクリエイターの投稿がありません' 
                : 'まだ投稿がありません'}
            </p>
          </div>
        )}
      </div>
      
      {/* 投稿モーダル */}
      {showPostModal && (
        <PostVoiceModal onClose={() => setShowPostModal(false)} />
      )}
    </div>
  )
}