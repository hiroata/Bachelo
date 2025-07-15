'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Heart, Star, Play, Trash2, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface FavoriteItem {
  id: string
  type: 'voice' | 'post' | 'creator'
  title: string
  description?: string
  thumbnail?: string
  creator?: {
    name: string
    avatar?: string
  }
  addedAt: string
  duration?: number
  viewCount?: number
}

// ダミーデータ
const dummyFavorites: FavoriteItem[] = [
  {
    id: '1',
    type: 'voice',
    title: '癒し系ボイス - おやすみ前に',
    description: '優しい声で眠りへと誘います',
    creator: {
      name: 'ゆめちゃん',
      avatar: '😊'
    },
    addedAt: '2024-01-10T10:00:00Z',
    duration: 180,
    viewCount: 1523
  },
  {
    id: '2',
    type: 'post',
    title: '初めての体験談を投稿しました',
    description: '恥ずかしいけど、みんなに聞いてもらいたくて...',
    creator: {
      name: '匿名ユーザー',
      avatar: '🎭'
    },
    addedAt: '2024-01-09T15:30:00Z',
    viewCount: 892
  },
  {
    id: '3',
    type: 'creator',
    title: 'さくらボイス',
    description: 'ASMRやシチュエーションボイスを投稿しています',
    creator: {
      name: 'さくらボイス',
      avatar: '🌸'
    },
    addedAt: '2024-01-08T20:00:00Z'
  }
]

export default function DashboardFavoritesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'voice' | 'post' | 'creator'>('all')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }
    
    // TODO: Fetch actual favorites from database
    setTimeout(() => {
      setFavorites(dummyFavorites)
      setLoading(false)
    }, 1000)
  }, [user, router])

  const handleRemoveFavorite = async (id: string) => {
    try {
      // TODO: Implement remove favorite logic
      setFavorites(favorites.filter(fav => fav.id !== id))
      toast.success('お気に入りから削除しました')
    } catch (error) {
      toast.error('削除に失敗しました')
    }
  }

  const filteredFavorites = favorites.filter(fav => {
    const matchesSearch = fav.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         fav.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || fav.type === filterType
    return matchesSearch && matchesType
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return '今日'
    if (diffDays === 1) return '昨日'
    if (diffDays < 7) return `${diffDays}日前`
    
    return date.toLocaleDateString('ja-JP')
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getItemLink = (item: FavoriteItem) => {
    switch (item.type) {
      case 'voice':
        return `/voice/${item.id}`
      case 'post':
        return `/board/post/${item.id}`
      case 'creator':
        return `/creators/${item.id}`
      default:
        return '#'
    }
  }

  const getTypeIcon = (type: FavoriteItem['type']) => {
    switch (type) {
      case 'voice':
        return <Play className="w-4 h-4" />
      case 'post':
        return <Heart className="w-4 h-4" />
      case 'creator':
        return <Star className="w-4 h-4" />
    }
  }

  const getTypeLabel = (type: FavoriteItem['type']) => {
    switch (type) {
      case 'voice':
        return '音声'
      case 'post':
        return '投稿'
      case 'creator':
        return 'クリエイター'
    }
  }

  if (loading || !user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Heart className="w-8 h-8 text-pink-500" />
          お気に入り
        </h1>
        <div className="text-sm text-gray-500">
          {filteredFavorites.length} 件のお気に入り
        </div>
      </div>

      {/* 検索・フィルター */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="お気に入りを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="all">すべて</option>
              <option value="voice">音声のみ</option>
              <option value="post">投稿のみ</option>
              <option value="creator">クリエイターのみ</option>
            </select>
          </div>
        </div>
      </div>

      {/* お気に入りリスト */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
        </div>
      ) : filteredFavorites.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">
            {searchQuery || filterType !== 'all' 
              ? '該当するお気に入りが見つかりません' 
              : 'まだお気に入りがありません'}
          </p>
          <Link href="/board">
            <button className="text-pink-600 hover:text-pink-700 font-medium">
              コンテンツを探す →
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFavorites.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                {/* タイプバッジ */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    item.type === 'voice' ? 'bg-purple-100 text-purple-700' :
                    item.type === 'post' ? 'bg-pink-100 text-pink-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {getTypeIcon(item.type)}
                    {getTypeLabel(item.type)}
                  </span>
                  <button
                    onClick={() => handleRemoveFavorite(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="お気に入りから削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* コンテンツ */}
                <Link href={getItemLink(item)}>
                  <h3 className="font-semibold text-gray-900 hover:text-pink-600 transition-colors mb-2">
                    {item.title}
                  </h3>
                </Link>
                
                {item.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {item.description}
                  </p>
                )}

                {/* クリエイター情報 */}
                {item.creator && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full flex items-center justify-center text-white text-xs">
                      {item.creator.avatar || item.creator.name[0]}
                    </div>
                    <span className="text-sm text-gray-700">{item.creator.name}</span>
                  </div>
                )}

                {/* メタ情報 */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatDate(item.addedAt)}に追加</span>
                  <div className="flex items-center gap-3">
                    {item.duration && (
                      <span>{formatDuration(item.duration)}</span>
                    )}
                    {item.viewCount && (
                      <span>{item.viewCount.toLocaleString()} 回視聴</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}