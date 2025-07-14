'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { User, Clock, Calendar, Edit3, Heart, MessageCircle, Repeat2, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { toast } from 'react-hot-toast'

interface Creator {
  id: string
  name: string
  displayId: string
  avatar: string
  bio: string
  location: string
  birthdate: string
  gender: string
  isOnline?: boolean
}

interface Post {
  id: string
  type: 'video' | 'timeline' | 'album'
  content: string
  thumbnail?: string
  timestamp: string
  hashtags?: string[]
  views?: number
}

// ダミーデータ
const dummyCreator: Creator = {
  id: '1',
  name: 'のあ',
  displayId: 'sarah_555',
  avatar: '/avatars/1.jpg',
  bio: `152-41 軽いです。男の人には軽く持ち上げられちゃいます。
おっぱいは小さいです（泣）
軽いのでよく駅弁しやすいと言われています。
駅弁の... 全文表示`,
  location: '東京',
  birthdate: '非公開',
  gender: '女',
}

const dummyPosts: Post[] = [
  {
    id: '1',
    type: 'video',
    content: 'バイアグラで即勃起！幅広い層から信頼されている男の味方！',
    thumbnail: '/thumbnails/1.jpg',
    timestamp: '2024-01-11 10:30',
    hashtags: ['#CS', '#野外', '#ハメ撮り'],
    views: 2580
  },
  {
    id: '2',
    type: 'timeline',
    content: 'この前のと同じだけど営業うからこっちも載せておきますいつも 投稿者：ReFa',
    timestamp: '2024-01-11 09:15',
  },
  {
    id: '3',
    type: 'album',
    content: 'BACHELO IDの新着アルバム画像　最終更新日時: 12日 01:02:48',
    thumbnail: '/thumbnails/3.jpg',
    timestamp: '2024-01-12 01:02',
  },
  {
    id: '4',
    type: 'video',
    content: 'バイアグラのジェネリック"カマグラゴールド"でED改善！',
    thumbnail: '/thumbnails/4.jpg',
    timestamp: '2024-01-10 22:45',
  },
  {
    id: '5',
    type: 'timeline',
    content: '貧乳-露出画像掲示板 - 画像見せたい女',
    timestamp: '2024-01-10 20:15',
    views: 11005
  },
]

export default function CreatorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [creator, setCreator] = useState<Creator | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'timeline' | 'album'>('timeline')

  useEffect(() => {
    // TODO: Fetch actual creator data
    setTimeout(() => {
      setCreator(dummyCreator)
      setPosts(dummyPosts)
      setLoading(false)
    }, 500)
  }, [params.id])

  const handleMessage = () => {
    toast('メッセージ機能は準備中です')
  }

  const handleFollow = () => {
    toast.success('フォローしました')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (!creator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">クリエイターが見つかりません</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white border-b">
          <div className="p-6">
            <div className="flex items-start gap-6">
              {/* アバター */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-200">
                  <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                    {creator.name[0]}
                  </div>
                </div>
              </div>

              {/* プロフィール情報 */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">{creator.displayId}</h1>
                  <span className="text-pink-600 text-sm">[ID: {creator.displayId}]</span>
                </div>

                {/* 基本情報 */}
                <div className="space-y-1 text-sm text-gray-600 mb-4">
                  <div>性別: {creator.gender}</div>
                  <div>年齢: {creator.birthdate}</div>
                  <div>血液型: A型</div>
                  <div>誕生日: {creator.birthdate}</div>
                  <div>エリア: {creator.location}</div>
                </div>

                {/* 自己PR */}
                <div className="mb-4">
                  <h3 className="font-medium mb-2">自己PR</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {creator.bio}
                    <button className="text-pink-600 hover:text-pink-700 ml-1">
                      全文表示
                    </button>
                  </p>
                </div>

                {/* アクションボタン */}
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => toast('この機能は準備中です')}
                  >
                    ひとことメッセージ
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => toast('この機能は準備中です')}
                  >
                    アルバムを見る
                  </Button>
                  <Button 
                    size="sm"
                    variant="primary"
                    onClick={() => toast('この機能は準備中です')}
                  >
                    動画を見る
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 投稿者情報 */}
        <div className="bg-yellow-50 border-t border-b border-yellow-200 p-4">
          <p className="text-sm text-gray-700">
            <span className="font-medium text-gray-900">📝 のあさんの投稿(最新5件)</span>
            <span className="ml-2 text-xs text-gray-500">投稿はありません。</span>
          </p>
        </div>

        {/* タイムライン */}
        <div className="bg-white">
          <div className="p-6">
            <div className="text-center mb-6">
              <p className="text-lg text-gray-700">
                BACHELO IDにログインすると伝言板へのメッセージ投稿、メールやトークなどのSNS機能をご利用いただけます！
              </p>
              <p className="text-sm text-gray-500 mt-2">
                ※BACHELO IDは完全無料のサービスです。
              </p>
              <Button 
                className="mt-4"
                size="lg"
                onClick={() => router.push('/register')}
              >
                新規会員登録
              </Button>
            </div>

            {/* 投稿一覧 */}
            <div className="space-y-4 mt-8">
              {posts.map((post) => (
                <div key={post.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex gap-3">
                    {post.thumbnail && (
                      <div className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400"></div>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          {post.type === 'video' && (
                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded mb-1">
                              【プロフ動画】
                            </span>
                          )}
                          {post.type === 'album' && (
                            <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded mb-1">
                              【アルバム】
                            </span>
                          )}
                          <p className="text-sm text-gray-800 mb-1">
                            {post.content}
                          </p>
                          {post.hashtags && (
                            <div className="flex flex-wrap gap-1">
                              {post.hashtags.map((tag, index) => (
                                <span key={index} className="text-xs text-blue-600">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {post.timestamp}
                        </div>
                      </div>
                      {post.views && (
                        <div className="text-xs text-gray-500 mt-1">
                          {post.views.toLocaleString()}回視聴
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ページング */}
            <div className="mt-8 space-y-4">
              <div className="text-sm">
                <Link href="#" className="text-blue-600 hover:underline">マイページ</Link>
              </div>
              <div className="space-y-1 text-sm">
                <Link href="#" className="text-blue-600 hover:underline block">ID友達検索</Link>
                <Link href="#" className="text-blue-600 hover:underline block">総合タイムライン</Link>
                <Link href="#" className="text-blue-600 hover:underline block">プロフィール動画</Link>
                <Link href="#" className="text-blue-600 hover:underline block">BACHELO地域別掲示板</Link>
                <Link href="#" className="text-blue-600 hover:underline block">BACHELO総合ナビ</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}