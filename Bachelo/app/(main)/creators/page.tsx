'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'

interface Creator {
  id: string
  name: string
  displayId: string
  avatar: string
  coverImage?: string
  description: string
  isOnline?: boolean
}

// ダミーデータ
const dummyCreators: Creator[] = [
  {
    id: '1',
    name: 'ニューダイ',
    displayId: 'newdai',
    avatar: '/avatars/1.jpg',
    coverImage: '',
    description: '癒し系ボイスをお届けします♪',
    isOnline: true
  },
  {
    id: '2',
    name: 'えむさん',
    displayId: 'emsan',
    avatar: '/avatars/2.jpg',
    description: 'ASMRボイスが得意です',
  },
  {
    id: '3',
    name: 'みるくさん',
    displayId: 'milksan',
    avatar: '/avatars/3.jpg',
    description: 'シチュエーションボイス承ります',
  },
  {
    id: '4',
    name: 'Yuさん',
    displayId: 'yu_voice',
    avatar: '/avatars/4.jpg',
    description: 'プロ声優として活動中',
    isOnline: true
  },
  {
    id: '5',
    name: 'ナナさん',
    displayId: 'nana7',
    avatar: '/avatars/5.jpg',
    description: '新人ですが頑張ります！',
  },
  {
    id: '6',
    name: 'のっちゃん',
    displayId: 'nocchan',
    avatar: '/avatars/6.jpg',
    description: 'お姉さん系ボイス',
  },
  {
    id: '7',
    name: '鈴音（すず）',
    displayId: 'suzune',
    avatar: '/avatars/7.jpg',
    description: '妹系ボイスならお任せ！',
  },
  {
    id: '8',
    name: 'ぽちゃ子さん',
    displayId: 'pochako',
    avatar: '/avatars/8.jpg',
    coverImage: '',
    description: 'ぽっちゃり系ボイス',
    isOnline: true
  }
]

export default function CreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // TODO: Fetch actual creators from database
    setTimeout(() => {
      setCreators(dummyCreators)
      setLoading(false)
    }, 500)
  }, [])

  const filteredCreators = creators.filter(creator =>
    creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    creator.displayId.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* メインコンテンツ */}
        <div className="flex-1">
          <div className="bg-white border-b">
            <div className="container mx-auto px-4 py-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">BACHELOメンバー</h1>
              
              {/* 説明文 */}
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">
                  IDやメンバーのプロフィールページです。ログインする事でお話を聞く様々なSNS機能をご利用いただけます。
                  <Link href="/login" className="text-pink-600 hover:text-pink-700 ml-1">
                    &gt;&gt; ログイン
                  </Link>
                </p>
              </div>

              {/* 検索ボックス */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="メンバーを検索"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
          </div>

          {/* メンバーグリッド */}
          <div className="container mx-auto px-4 py-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
              </div>
            ) : filteredCreators.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">該当するメンバーが見つかりません</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {filteredCreators.map(creator => (
                  <Link key={creator.id} href={`/creators/${creator.id}`}>
                    <div className="group cursor-pointer">
                      <div className="relative">
                        {/* カバー画像または背景色 */}
                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-200">
                          {creator.coverImage ? (
                            <img
                              src={creator.coverImage}
                              alt={creator.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-pink-200 to-purple-200"></div>
                          )}
                        </div>
                        
                        {/* アバター */}
                        <div className="absolute bottom-2 left-2">
                          <div className="w-16 h-16 rounded-full border-3 border-white overflow-hidden bg-white">
                            <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                              {creator.name[0]}
                            </div>
                          </div>
                          {creator.isOnline && (
                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                      </div>
                      
                      {/* 名前 */}
                      <div className="mt-2 px-2">
                        <h3 className="font-medium text-gray-800 group-hover:text-pink-600 transition-colors">
                          {creator.name}
                        </h3>
                        <p className="text-xs text-gray-500">@{creator.displayId}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* サイドバー */}
        <div className="w-80 bg-white border-l p-6 hidden lg:block">
          <h2 className="font-bold text-lg mb-4">BACHELOメンバー</h2>
          
          {/* メンバーリスト */}
          <div className="space-y-4">
            {creators.slice(0, 8).map((creator) => (
              <Link key={creator.id} href={`/creators/${creator.id}`}>
                <div className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                      <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white font-bold">
                        {creator.name[0]}
                      </div>
                    </div>
                    {creator.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{creator.name}</div>
                    <div className="text-xs text-gray-500 truncate">{creator.description}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* 友達検索 */}
          <div className="mt-8">
            <Link href="/search" className="flex items-center gap-2 text-pink-600 hover:text-pink-700">
              <Search className="w-5 h-5" />
              <span className="font-medium">友達検索</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}