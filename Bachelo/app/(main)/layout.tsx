'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Home, User, Mic, LogOut, Menu, MessageSquare, Crown, Sparkles, TrendingUp } from 'lucide-react'
import { useState } from 'react'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, profile, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: '掲示板', href: '/board', icon: MessageSquare },
    { name: 'クリエイター', href: '/creators', icon: User },
    { name: 'AI音声', href: '/ai-voice', icon: Sparkles },
    { name: 'プレミアム', href: '/premium', icon: Crown },
    ...(user ? [{ name: 'ダッシュボード', href: '/dashboard', icon: Home }] : []),
  ]

  return (
    <>
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/board" className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-pink-500">BACHELO</span>
                <span className="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded-full font-semibold">日本No.1</span>
              </Link>
              
              <div className="hidden md:flex space-x-4">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-pink-100 text-pink-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="hidden md:flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      {profile?.display_name || 'ユーザー'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => signOut()}
                      className="flex items-center space-x-1"
                    >
                      <LogOut size={16} />
                      <span>ログアウト</span>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="hidden md:flex space-x-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      ログイン
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">
                      新規登録
                    </Button>
                  </Link>
                </div>
              )}
              
              <button
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                      isActive
                        ? 'bg-pink-100 text-pink-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              
              {user ? (
                <button
                  onClick={() => {
                    signOut()
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <LogOut size={20} />
                  <span>ログアウト</span>
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    ログイン
                  </Link>
                  <Link
                    href="/register"
                    className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    新規登録
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
      
      {children}
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-pink-400">Bachelo</h3>
              <p className="text-gray-400 text-sm">
                匿名音声掲示板 & アダルトボイスマーケットプレイス
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">サービス</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/board" className="text-gray-400 hover:text-white transition-colors">
                    掲示板
                  </Link>
                </li>
                <li>
                  <Link href="/board/categories" className="text-gray-400 hover:text-white transition-colors">
                    全カテゴリー 🔥
                  </Link>
                </li>
                <li>
                  <Link href="/board/regional" className="text-gray-400 hover:text-white transition-colors">
                    地域別掲示板
                  </Link>
                </li>
                <li>
                  <Link href="/board/ranking" className="text-gray-400 hover:text-white transition-colors">
                    人気ランキング
                  </Link>
                </li>
                <li>
                  <Link href="/creators" className="text-gray-400 hover:text-white transition-colors">
                    クリエイター一覧
                  </Link>
                </li>
                <li>
                  <Link href="/ai-voice" className="text-gray-400 hover:text-white transition-colors">
                    AI音声生成
                  </Link>
                </li>
                <li>
                  <Link href="/premium" className="text-gray-400 hover:text-white transition-colors">
                    プレミアムプラン
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">法的情報</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                    利用規約
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                    プライバシーポリシー
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    お問い合わせ
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 Bachelo. All rights reserved. | 18歳未満の方の利用は固く禁止します
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}