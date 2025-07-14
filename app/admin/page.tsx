'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Users, MessageSquare, Mic, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalReports: number
  pendingReports: number
  totalPosts: number
  totalVoicePosts: number
  todayPosts: number
  activeUsers: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalReports: 0,
    pendingReports: 0,
    totalPosts: 0,
    totalVoicePosts: 0,
    todayPosts: 0,
    activeUsers: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      // 通報統計を取得
      const reportsResponse = await fetch('/api/reports?status=pending&per_page=1')
      const reportsData = await reportsResponse.json()
      
      // TODO: 他の統計情報も取得するAPIを実装
      setStats(prev => ({
        ...prev,
        pendingReports: reportsData.total || 0
      }))
    } catch (error) {
      console.error('統計情報の取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: '未対応の通報',
      value: stats.pendingReports,
      icon: AlertTriangle,
      color: 'bg-red-500',
      link: '/admin/moderation'
    },
    {
      title: '総投稿数',
      value: stats.totalPosts,
      icon: MessageSquare,
      color: 'bg-blue-500',
      link: null
    },
    {
      title: '音声投稿数',
      value: stats.totalVoicePosts,
      icon: Mic,
      color: 'bg-purple-500',
      link: null
    },
    {
      title: '本日の投稿',
      value: stats.todayPosts,
      icon: TrendingUp,
      color: 'bg-green-500',
      link: null
    }
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">管理者ダッシュボード</h1>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
        </div>
      ) : (
        <>
          {/* 統計カード */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.color} text-white p-3 rounded-lg`}>
                      <Icon size={24} />
                    </div>
                    <span className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </span>
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium">
                    {stat.title}
                  </h3>
                  {stat.link && (
                    <Link
                      href={stat.link}
                      className="text-pink-500 text-sm hover:text-pink-600 mt-2 inline-block"
                    >
                      詳細を見る →
                    </Link>
                  )}
                </div>
              )
            })}
          </div>

          {/* クイックアクション */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">クイックアクション</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/admin/moderation"
                className="border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 mb-1">通報を確認</h3>
                <p className="text-sm text-gray-600">
                  未対応の通報を確認して対応する
                </p>
              </Link>
              <Link
                href="/admin/settings"
                className="border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 mb-1">サイト設定</h3>
                <p className="text-sm text-gray-600">
                  NGワードやモデレーション設定を管理
                </p>
              </Link>
              <Link
                href="/"
                className="border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 mb-1">サイトを確認</h3>
                <p className="text-sm text-gray-600">
                  ユーザー視点でサイトを確認する
                </p>
              </Link>
            </div>
          </div>

          {/* 最近の活動 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">最近の活動</h2>
            <div className="text-gray-600">
              <p>活動ログの実装予定</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}