'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Heart, MessageCircle, ShoppingCart, Play, Pause } from 'lucide-react'
import { Database } from '@/types/database'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

type VoicePost = Database['public']['Tables']['voice_posts']['Row'] & {
  creator: Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'username' | 'display_name' | 'avatar_url'>
  likes: { count: number }[]
  comments: { count: number }[]
}

interface VoicePostCardProps {
  post: VoicePost
}

export default function VoicePostCard({ post }: VoicePostCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes[0]?.count || 0)
  const [showComments, setShowComments] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
  const supabase = createClientComponentClient<Database>()
  const router = useRouter()
  const { user } = useAuth()
  
  const handleLike = async () => {
    if (!user) {
      toast.error('ログインが必要です')
      return
    }
    
    try {
      if (isLiked) {
        await supabase
          .from('post_likes')
          .delete()
          .match({ post_id: post.id, user_id: user.id })
        setLikeCount((prev: number) => prev - 1)
      } else {
        await supabase
          .from('post_likes')
          .insert({ post_id: post.id, user_id: user.id })
        setLikeCount((prev: number) => prev + 1)
      }
      setIsLiked(!isLiked)
    } catch (error) {
      toast.error('エラーが発生しました')
    }
  }
  
  const handleOrder = () => {
    router.push(`/order/${post.creator.id}?ref=post_${post.id}`)
  }
  
  const togglePlay = () => {
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause()
      } else {
        audioElement.play()
        // 再生回数を増やす
        supabase.rpc('increment_play_count', { post_id: post.id })
      }
      setIsPlaying(!isPlaying)
    }
  }
  
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="p-4">
        {/* クリエイター情報 */}
        <div className="flex items-center mb-3">
          <div className="flex items-center flex-1">
            {post.creator.avatar_url ? (
              <img
                src={post.creator.avatar_url}
                alt={post.creator.display_name}
                className="w-10 h-10 rounded-full mr-3"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white font-bold mr-3">
                {post.creator.display_name[0]}
              </div>
            )}
            <div>
              <div className="font-semibold">{post.creator.display_name}</div>
              <div className="text-sm text-gray-500">@{post.creator.username}</div>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {new Date(post.created_at).toLocaleDateString()}
          </div>
        </div>
        
        {/* タイトルと説明 */}
        <h3 className="font-bold text-lg mb-2">{post.title}</h3>
        {post.description && (
          <p className="text-gray-700 mb-3">{post.description}</p>
        )}
        
        {/* タグ */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.tags.map((tag: string) => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}
        
        {/* 音声プレイヤー */}
        <div className="bg-gray-100 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <button
              onClick={togglePlay}
              className="w-12 h-12 bg-pink-500 text-white rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <div className="flex-1 mx-4">
              <div className="h-1 bg-gray-300 rounded-full">
                <div className="h-1 bg-pink-500 rounded-full w-0 transition-all duration-300" />
              </div>
            </div>
            <span className="text-sm text-gray-600">{post.duration_seconds}秒</span>
          </div>
          <audio
            ref={setAudioElement}
            src={post.audio_url}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
          <div className="mt-2 text-sm text-gray-500 text-center">
            {post.play_count}回再生
          </div>
        </div>
        
        {/* アクションボタン */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 transition-colors ${
                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
              <span className="text-sm">{likeCount}</span>
            </button>
            
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <MessageCircle size={20} />
              <span className="text-sm">{post.comments[0]?.count || 0}</span>
            </button>
          </div>
          
          <Button
            size="sm"
            onClick={handleOrder}
            className="flex items-center space-x-1"
          >
            <ShoppingCart size={16} />
            <span>この声でオーダー</span>
          </Button>
        </div>
      </div>
      
      {/* コメント表示エリア */}
      {showComments && (
        <div className="border-t px-4 py-3 bg-gray-50">
          <PostComments postId={post.id} />
        </div>
      )}
    </div>
  )
}

function PostComments({ postId }: { postId: string }) {
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient<Database>()
  const { user } = useAuth()
  
  // コメント取得の実装は省略
  
  return (
    <div>
      <p className="text-sm text-gray-500 text-center py-4">
        コメント機能は準備中です
      </p>
    </div>
  )
}