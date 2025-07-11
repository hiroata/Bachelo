'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Eye, TrendingUp, Users, Heart, MessageCircle } from 'lucide-react'
import { BoardPost } from '@/types/board'
import { toast } from 'react-hot-toast'

// カテゴリータブ
const tabs = [
  { id: 'genre', label: 'ジャンル', value: 'エロ話' },
  { id: 'style', label: '動画', value: '' },
  { id: 'media', label: '画像', value: '' },
  { id: 'experience', label: '体験談', value: '', active: true },
  { id: 'escort', label: '官能小説', value: '' },
  { id: 'location', label: '地域別', value: '' },
  { id: 'voice', label: '音声', value: '' },
  { id: 'social', label: 'SNS', value: '' },
  { id: 'news', label: 'ニュース', value: '' }
]

export default function ExperienceBoardPage() {
  const [posts, setPosts] = useState<BoardPost[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryId, setCategoryId] = useState<string | null>(null)

  // 体験談カテゴリーのIDを取得
  useEffect(() => {
    const fetchCategoryId = async () => {
      try {
        const response = await fetch('/api/board/categories')
        const categories = await response.json()
        const experienceCategory = categories.find(
          (cat: any) => cat.slug === 'confession' || cat.slug === 'experience'
        )
        if (experienceCategory) {
          setCategoryId(experienceCategory.id)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategoryId()
  }, [])

  // 投稿を取得
  useEffect(() => {
    if (!categoryId) return

    const fetchPosts = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/board/posts?category_id=${categoryId}&per_page=50`)
        const data = await response.json()
        
        // ビュー数でソート（デモ用にランダムなビュー数を生成）
        const postsWithViews = (data.posts || []).map((post: BoardPost) => ({
          ...post,
          view_count: post.view_count || Math.floor(Math.random() * 5000) + 1000
        }))
        
        setPosts(postsWithViews.sort((a: any, b: any) => b.view_count - a.view_count))
      } catch (error) {
        console.error('Error fetching posts:', error)
        setPosts([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchPosts()
  }, [categoryId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return '今日'
    if (diffDays === 1) return '昨日'
    if (diffDays < 7) return `${diffDays}日前`
    
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー背景 */}
      <div className="relative h-64 bg-gradient-to-br from-pink-600 to-purple-700 overflow-hidden">
        {/* 背景画像のオーバーレイ */}
        <div className="absolute inset-0 bg-black/30"></div>
        
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-white">
          <h1 className="text-4xl font-bold mb-2">日本最大のアダルト掲示板</h1>
          <h2 className="text-2xl">エロ体験談投稿</h2>
          <p className="mt-4 text-lg">
            素人投稿のエロ体験談、様々なエッチ体験や変態プレイ。今よく読まれている人気の体験談はこちら！
          </p>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="bg-gray-900 border-b border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  tab.active
                    ? 'bg-pink-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <div>{tab.label}</div>
                {tab.value && <div className="text-xs mt-1">{tab.value}</div>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="bg-blue-50 border border-blue-200 py-4">
        <div className="container mx-auto px-4">
          <p className="text-center text-blue-700">
            日本最大の素人投稿アダルト掲示板ナンネット！日々大量にいただく投稿は削除依頼等なものばかり！
          </p>
          <p className="text-center text-blue-600 font-bold text-2xl mt-2">
            只今の新着投稿 6255 件
          </p>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 投稿ランキング */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-t-lg">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <TrendingUp className="w-6 h-6" />
                  新着人気の体験談
                </h3>
              </div>
              
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
                </div>
              ) : posts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  まだ投稿がありません
                </div>
              ) : (
                <div className="divide-y">
                  {posts.slice(0, 20).map((post, index) => (
                    <div key={post.id} className="p-4 hover:bg-gray-50 transition">
                      <div className="flex items-start gap-4">
                        {/* ランキング番号 */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded flex items-center justify-center font-bold text-white ${
                          index === 0 ? 'bg-orange-500' :
                          index === 1 ? 'bg-yellow-500' :
                          index === 2 ? 'bg-yellow-600' :
                          'bg-gray-400'
                        }`}>
                          {index + 1}
                        </div>
                        
                        {/* 投稿内容 */}
                        <div className="flex-1">
                          <Link 
                            href={`/board/post/${post.id}`}
                            className="text-blue-700 hover:text-blue-900 font-medium text-lg block mb-1"
                          >
                            {post.title}
                          </Link>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{post.author_name}</span>
                            <span>{formatDate(post.created_at)}</span>
                            <span className="text-red-600 font-bold flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {post.view_count}view
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* ナンネット掲示板 */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 -m-4 mb-4 rounded-t-lg">
                <h4 className="font-bold">ナンネット掲示板</h4>
              </div>
              <p className="text-sm text-gray-600">
                日本最大の素人投稿アダルト掲示板。露出・人妻など様々なカテゴリ、画像や動画の投稿も！
              </p>
            </div>

            {/* ナンネットID */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 -m-4 mb-4 rounded-t-lg">
                <h4 className="font-bold">ナンネットID</h4>
              </div>
              <p className="text-sm text-gray-600">
                ナンネットIDを取得するとナンネットの様々なサービスをご利用いただけます。
              </p>
            </div>

            {/* 地域別掲示板アダコミ */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 -m-4 mb-4 rounded-t-lg">
                <h4 className="font-bold">地域別掲示板アダコミ</h4>
              </div>
              <p className="text-sm text-gray-600">
                ID登録ユーザー専用の地域別掲示板。
              </p>
            </div>

            {/* タイムライン */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-3 -m-4 mb-4 rounded-t-lg">
                <h4 className="font-bold">タイムライン</h4>
              </div>
              <p className="text-sm text-gray-600">
                あなたの今日の出来事は？ナンネットユーザーと今をシェアしよう！
              </p>
            </div>

            {/* 総合ナビ */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-3 -m-4 mb-4 rounded-t-lg">
                <h4 className="font-bold">総合ナビ</h4>
              </div>
              <p className="text-sm text-gray-600">
                ナンネットの総合案内ページ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 投稿ボタン */}
      <Link
        href={`/board?category=${categoryId}`}
        className="fixed bottom-8 right-8 bg-pink-600 hover:bg-pink-700 text-white rounded-full p-4 shadow-lg transition-colors flex items-center gap-2 px-6"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="font-medium">体験談を投稿する</span>
      </Link>
    </div>
  )
}