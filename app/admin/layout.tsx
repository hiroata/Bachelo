'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Shield, AlertTriangle, BarChart, Settings, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, profile, signOut } = useAuth()
  const router = useRouter()

  // TODO: 管理者権限のチェックを実装
  // useEffect(() => {
  //   if (!user || profile?.role !== 'admin') {
  //     router.push('/')
  //   }
  // }, [user, profile, router])

  const navigation = [
    { name: 'ダッシュボード', href: '/admin', icon: BarChart },
    { name: '通報管理', href: '/admin/moderation', icon: AlertTriangle },
    { name: '設定', href: '/admin/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* サイドバー */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white">
        <div className="p-6">
          <h2 className="text-2xl font-bold flex items-center">
            <Shield className="mr-2" size={28} />
            管理画面
          </h2>
        </div>

        <nav className="mt-6">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white border-l-4 border-pink-500'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon size={20} className="mr-3" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-6">
          <button
            onClick={() => signOut()}
            className="flex items-center text-gray-300 hover:text-white transition-colors"
          >
            <LogOut size={20} className="mr-3" />
            ログアウト
          </button>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="pl-64">
        {/* トップバー */}
        <header className="bg-white shadow">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">
                {pathname === '/admin' && 'ダッシュボード'}
                {pathname === '/admin/moderation' && '通報管理'}
                {pathname === '/admin/settings' && '設定'}
              </h1>
              <Link
                href="/"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                サイトに戻る →
              </Link>
            </div>
          </div>
        </header>

        {/* ページコンテンツ */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}