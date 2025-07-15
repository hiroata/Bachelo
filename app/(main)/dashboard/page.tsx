'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { ShoppingCart, DollarSign, Mic, Settings } from 'lucide-react'

export default function DashboardPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  const isCreator = profile.role === 'creator'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">ダッシュボード</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isCreator ? (
            <>
              <DashboardCard
                title="受注管理"
                description="新規注文の確認と対応"
                icon={ShoppingCart}
                href="/dashboard/orders"
                color="bg-blue-500"
              />
              <DashboardCard
                title="売上管理"
                description="売上の確認と分析"
                icon={DollarSign}
                href="/dashboard/earnings"
                color="bg-green-500"
              />
              <DashboardCard
                title="音声投稿"
                description="新しい音声を投稿"
                icon={Mic}
                href="/timeline"
                color="bg-purple-500"
              />
              <DashboardCard
                title="プロフィール設定"
                description="プロフィールの編集"
                icon={Settings}
                href="/dashboard/settings"
                color="bg-gray-500"
              />
            </>
          ) : (
            <>
              <DashboardCard
                title="注文履歴"
                description="過去の注文を確認"
                icon={ShoppingCart}
                href="/dashboard/orders"
                color="bg-blue-500"
              />
              <DashboardCard
                title="お気に入り"
                description="お気に入りクリエイター"
                icon={DollarSign}
                href="/dashboard/favorites"
                color="bg-pink-500"
              />
              <DashboardCard
                title="プロフィール設定"
                description="プロフィールの編集"
                icon={Settings}
                href="/dashboard/settings"
                color="bg-gray-500"
              />
            </>
          )}
        </div>
        
        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">アカウント情報</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-500">ユーザー名</dt>
              <dd className="text-lg font-medium">@{profile.username}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">表示名</dt>
              <dd className="text-lg font-medium">{profile.display_name}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">アカウントタイプ</dt>
              <dd className="text-lg font-medium">
                {isCreator ? 'クリエイター' : 'クライアント'}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">登録日</dt>
              <dd className="text-lg font-medium">
                {new Date(profile.created_at).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}

interface DashboardCardProps {
  title: string
  description: string
  icon: React.ElementType
  href: string
  color: string
}

function DashboardCard({ title, description, icon: Icon, href, color }: DashboardCardProps) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer">
        <div className={`inline-flex p-3 rounded-lg ${color} text-white mb-4`}>
          <Icon size={24} />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </Link>
  )
}