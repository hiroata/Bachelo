'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin, Heart, Users, Camera, MessageCircle } from 'lucide-react'

// エロカテゴリー
const eroCategories = [
  { name: 'おちんちん', slug: 'penis', icon: '🍆', count: 1243 },
  { name: '接写ちん', slug: 'closeup', icon: '🔍', count: 892 },
  { name: 'みーちん', slug: 'showing', icon: '👀', count: 756 },
  { name: 'ゆう（友達）', slug: 'friends', icon: '👫', count: 623 },
  { name: 'へんちん', slug: 'hentai', icon: '😈', count: 534 },
  { name: 'なーちん', slug: 'masturbation', icon: '💦', count: 1567 },
  { name: 'はちんちん', slug: 'hairy', icon: '🌳', count: 423 },
  { name: 'のつちん', slug: 'brain', icon: '🧠', count: 234 },
  { name: 'takekaze', slug: 'takekaze', icon: '🌬️', count: 189 },
  { name: '西成オナ派会', slug: 'seisei', icon: '🎆', count: 567 },
  { name: 'おしりちん', slug: 'ass', icon: '🍑', count: 2341 },
  { name: 'sionちん', slug: 'sion', icon: '✨', count: 345 },
  { name: 'ゆかりちん', slug: 'yukari', icon: '👸', count: 678 }
];

// 地域データの定義
const regions = [
  {
    name: '北海道',
    slug: 'hokkaido',
    areas: ['札幌', '旭川', '帯広', '函館', '釧路'],
    description: '北の大地で熱い出会いを',
    activeUsers: 3421
  },
  {
    name: '東北',
    slug: 'tohoku',
    areas: ['青森', '岩手', '宮城', '秋田', '山形', '福島'],
    description: '純情な出会いから刺激的な関係まで',
    activeUsers: 2156
  },
  {
    name: '関東',
    slug: 'kanto',
    areas: ['茨城', '栃木', '群馬', '埼玉', '千葉', '東京', '神奈川'],
    description: '人口最多！アクティブな出会い',
    activeUsers: 15678
  },
  {
    name: '北陸・甲信越',
    slug: 'hokuriku',
    areas: ['新潟', '富山', '石川', '福井', '山梨', '長野'],
    description: '雪国の熱い恋',
    activeUsers: 1876
  },
  {
    name: '東海',
    slug: 'tokai',
    areas: ['岐阜', '静岡', '愛知', '三重'],
    description: '情熱的な出会いを求めて',
    activeUsers: 4532
  },
  {
    name: '関西・近畿',
    slug: 'kansai',
    areas: ['滋賀', '京都', '大阪', '兵庫', '奈良', '和歌山'],
    description: 'ノリのいい関係を',
    activeUsers: 8934
  },
  {
    name: '中国',
    slug: 'chugoku',
    areas: ['鳥取', '島根', '岡山', '広島', '山口'],
    description: '穏やかな土地での出会い',
    activeUsers: 2341
  },
  {
    name: '四国',
    slug: 'shikoku',
    areas: ['徳島', '香川', '愛媛', '高知'],
    description: 'アットホームな雰囲気で',
    activeUsers: 1234
  },
  {
    name: '九州・沖縄',
    slug: 'kyushu',
    areas: ['福岡', '佐賀', '長崎', '熊本', '大分', '宮崎', '鹿児島', '沖縄'],
    description: '南国の情熱的な出会い',
    activeUsers: 5678
  },
  {
    name: '全国',
    slug: 'all',
    areas: ['全地域共有'],
    description: '全国どこでもOK！',
    activeUsers: 45678
  }
]

export default function RegionalBoardPage() {
  const [selectedTab, setSelectedTab] = useState<'categories' | 'regions'>('regions');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      {/* 背景にエロティックなシルエット */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 text-pink-300 text-9xl">♥</div>
        <div className="absolute bottom-20 right-20 text-purple-300 text-9xl rotate-45">♥</div>
        <div className="absolute top-1/2 left-1/3 text-pink-400 text-7xl rotate-12">♥</div>
      </div>
      
      {/* グラデーションオーバーレイ */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 z-0"></div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🔥 エロカテゴリー & 地域掲示板 🔥
          </h1>
          <p className="text-pink-300 text-lg">
            激エロ画像や地域別の出会いを探そう！
          </p>
        </div>

        {/* タブ切り替え */}
        <div className="flex justify-center mb-8">
          <div className="bg-black/30 backdrop-blur-sm rounded-full p-1">
            <button
              onClick={() => setSelectedTab('categories')}
              className={`px-6 py-3 rounded-full font-semibold transition ${
                selectedTab === 'categories'
                  ? 'bg-pink-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Camera className="inline-block w-5 h-5 mr-2" />
              エロカテゴリー
            </button>
            <button
              onClick={() => setSelectedTab('regions')}
              className={`px-6 py-3 rounded-full font-semibold transition ${
                selectedTab === 'regions'
                  ? 'bg-pink-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <MapPin className="inline-block w-5 h-5 mr-2" />
              地域掲示板
            </button>
          </div>
        </div>

        {selectedTab === 'categories' ? (
          /* エロカテゴリー一覧 */
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {eroCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/board/category/${category.slug}`}
                  className="group relative overflow-hidden"
                >
                  <div className="bg-gradient-to-br from-pink-600/80 to-purple-700/80 backdrop-blur-sm rounded-2xl p-6 hover:from-pink-500/90 hover:to-purple-600/90 transition-all duration-300 transform hover:scale-[1.05] hover:shadow-2xl">
                    <div className="text-center">
                      <div className="text-4xl mb-2">{category.icon}</div>
                      <h3 className="text-white font-bold text-lg mb-1">
                        {category.name}
                      </h3>
                      <p className="text-pink-100 text-sm">
                        {category.count.toLocaleString()}件
                      </p>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Heart className="w-5 h-5 text-white/50" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* 警告文 */}
            <div className="mt-8 bg-red-900/30 backdrop-blur-sm rounded-lg p-4 text-center">
              <p className="text-red-300 text-sm">
                ※18歳未満の方の閲覧・投稿は固くお断りします。投稿される全てのコンテンツはユーザーの責任でお願いします。
              </p>
              <p className="text-red-300 text-sm mt-2">
                違法・不適切なコンテンツは通報の上、削除されます。
              </p>
            </div>
          </div>
        ) : (
          /* 地域選択グリッド */
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {regions.map((region) => (
                <Link
                  key={region.slug}
                  href={`/board/regional/${region.slug}`}
                  className="group"
                >
                  <div className="bg-gradient-to-br from-green-600/80 to-green-700/80 backdrop-blur-sm rounded-2xl p-6 hover:from-green-500/90 hover:to-green-600/90 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-2xl font-bold text-white">
                        {region.name}
                      </h2>
                      <div className="flex items-center gap-1 text-green-200">
                        <Users className="w-5 h-5" />
                        <span className="text-sm">{region.activeUsers.toLocaleString()}</span>
                      </div>
                    </div>
                    <p className="text-green-100 text-sm mb-2">
                      {region.areas.join('　')}
                    </p>
                    <p className="text-green-200 text-xs">
                      {region.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 人気投稿プレビュー */}
        <div className="mt-12 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            🔥 今日の人気投稿 🔥
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-pink-500/30">
              <h3 className="text-pink-400 font-bold mb-2">【東京・池袋】今夜会える人💕</h3>
              <p className="text-gray-300 text-sm mb-2">旦那が出張中で寂しいです…一緒に飲みに行ってくれる人いませんか？</p>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>👁 1,234</span>
                <span>💕 89</span>
                <span>💬 23</span>
              </div>
            </div>
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-pink-500/30">
              <h3 className="text-pink-400 font-bold mb-2">【大阪・難波】セフレ募集中🔥</h3>
              <p className="text-gray-300 text-sm mb-2">20代OLです。週末だけ会える大人の関係希望…</p>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>👁 2,456</span>
                <span>💕 156</span>
                <span>💬 67</span>
              </div>
            </div>
          </div>
        </div>

        {/* トップに戻るリンク */}
        <div className="mt-8 text-center">
          <Link 
            href="/board" 
            className="text-green-400 hover:text-green-300 transition-colors inline-flex items-center gap-2"
          >
            ← 掲示板トップに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}