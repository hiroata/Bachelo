'use client'

import { useState, useEffect } from 'react'
import VoicePostCard from '@/components/voice-board/VoicePostCard'
import CategoryTabs from '@/components/voice-board/CategoryTabs'
import UploadModal from '@/components/voice-board/UploadModal'
import { useRealtimeVoicePosts } from '@/hooks/useRealtimeVoicePosts'

// デフォルトのモックデータ
const defaultMockPosts = {
  female: [
    {
      id: '1',
      username: 'カオリン',
      avatarEmoji: '😊',
      avatarColor: 'bg-pink-500',
      message: '私の恥ずかしいひとりエッチ',
      duration: 27,
      likes: 6,
      comments: 3,
      postedAt: '1日前',
      audioUrl: '/mock-audio/female1.mp3'
    },
    {
      id: '2',
      username: '96e',
      avatarEmoji: '🎀',
      avatarColor: 'bg-rose-500',
      message: '先生にオホ声を教えてもらう！？',
      duration: 34,
      likes: 5,
      comments: 2,
      postedAt: '20時間前',
      audioUrl: '/mock-audio/female2.mp3'
    },
    {
      id: '3',
      username: '*∩D_65782',
      avatarEmoji: '💕',
      avatarColor: 'bg-pink-400',
      message: '連続イキしてるのきいて',
      duration: 11,
      likes: 2,
      comments: 1,
      postedAt: '1日前',
      audioUrl: '/mock-audio/female3.mp3'
    }
  ],
  male: [
    {
      id: '4',
      username: 'タクヤ',
      avatarEmoji: '😎',
      avatarColor: 'bg-blue-500',
      message: '優しく囁きます',
      duration: 15,
      likes: 4,
      comments: 2,
      postedAt: '3時間前',
      audioUrl: '/mock-audio/male1.mp3'
    }
  ],
  couple: [
    {
      id: '5',
      username: 'ラブラブカップル',
      avatarEmoji: '💑',
      avatarColor: 'bg-cyan-500',
      message: '二人の甘い時間',
      duration: 45,
      likes: 8,
      comments: 4,
      postedAt: '5時間前',
      audioUrl: '/mock-audio/couple1.mp3'
    }
  ]
}

export default function VoiceBoardPage() {
  const [activeCategory, setActiveCategory] = useState<'female' | 'male' | 'couple'>('female')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [initialPosts, setInitialPosts] = useState<any[]>([])
  
  // リアルタイム投稿を使用
  const { posts: realtimePosts } = useRealtimeVoicePosts({ 
    category: activeCategory,
    initialPosts: initialPosts
  })
  
  // 初回の投稿を取得
  const fetchInitialPosts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/voice/upload?category=${activeCategory}&limit=20`)
      const data = await response.json()
      
      if (data.posts) {
        setInitialPosts(data.posts)
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  useEffect(() => {
    fetchInitialPosts()
  }, [activeCategory]) // eslint-disable-line react-hooks/exhaustive-deps
  
  const handleUploadComplete = () => {
    setShowUploadModal(false)
    // リアルタイム更新があるため、手動での再取得は不要
  }
  
  // リアルタイム投稿がある場合はそれを使用、ない場合はモックデータを表示
  const posts = realtimePosts.length > 0 ? realtimePosts : defaultMockPosts[activeCategory]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">スピード検索</h1>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-pink-500 text-white px-4 py-2 rounded-full font-medium hover:bg-pink-600 transition-colors flex items-center space-x-2"
            >
              <span>＋</span>
              <span>音声を投稿</span>
            </button>
          </div>
        </header>

        {/* カテゴリータブ */}
        <CategoryTabs 
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        {/* 注目の音声（総合） */}
        <section className="px-4 py-6">
          <h2 className="text-xl font-bold mb-4">注目の音声（総合）</h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
          ) : posts.length > 0 ? (
            <>
              <div className="space-y-4">
                {posts.map((post) => (
                  <VoicePostCard key={post.id} post={post} />
                ))}
              </div>

              {/* もっと見る */}
              <button className="w-full mt-6 py-3 text-center text-blue-600 font-medium border-t border-gray-200">
                もっと見る ＞
              </button>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              まだ投稿がありません。最初の投稿者になりましょう！
            </div>
          )}
        </section>
      </div>

      {/* アップロードモーダル */}
      {showUploadModal && (
        <UploadModal onClose={handleUploadComplete} />
      )}
    </div>
  )
}