'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { toast } from 'react-hot-toast'
import { User, Mail, Bell, Shield, Camera, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DashboardSettingsPage() {
  const router = useRouter()
  const { user, profile, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    email: user?.email || '',
    avatar: '',
    notificationEmail: true,
    notificationPush: false,
    privacyPublic: false,
    newsletter: true
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        ...formData,
        displayName: profile.display_name || '',
        bio: profile.bio || '',
        avatar: profile.avatar_url || ''
      })
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateProfile({
        display_name: formData.displayName,
        bio: formData.bio,
        avatar_url: formData.avatar
      })
      
      toast.success('設定を保存しました')
    } catch (error) {
      console.error('Settings update error:', error)
      toast.error('設定の保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // TODO: Implement avatar upload logic
    toast('アバター機能は準備中です')
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">アカウント設定</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* プロフィール設定 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-pink-500" />
            <h2 className="text-xl font-semibold">プロフィール設定</h2>
          </div>

          <div className="space-y-6">
            {/* アバター */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {formData.displayName?.[0]?.toUpperCase() || 'U'}
                </div>
                <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md cursor-pointer">
                  <Camera className="w-4 h-4 text-gray-600" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <p className="font-medium">プロフィール画像</p>
                <p className="text-sm text-gray-500">JPG、PNG、GIF（最大5MB）</p>
              </div>
            </div>

            {/* 表示名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                表示名
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                placeholder="あなたの名前"
              />
            </div>

            {/* 自己紹介 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                自己紹介
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                rows={4}
                placeholder="あなたについて教えてください"
              />
              <p className="text-sm text-gray-500 mt-1">最大500文字</p>
            </div>
          </div>
        </div>

        {/* メール設定 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Mail className="w-5 h-5 text-pink-500" />
            <h2 className="text-xl font-semibold">メール設定</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
              <p className="text-sm text-gray-500 mt-1">メールアドレスの変更はサポートにお問い合わせください</p>
            </div>
          </div>
        </div>

        {/* 通知設定 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Bell className="w-5 h-5 text-pink-500" />
            <h2 className="text-xl font-semibold">通知設定</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <div className="font-medium">メール通知</div>
                <div className="text-sm text-gray-500">重要なお知らせをメールで受け取る</div>
              </div>
              <input
                type="checkbox"
                checked={formData.notificationEmail}
                onChange={(e) => setFormData({ ...formData, notificationEmail: e.target.checked })}
                className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
              />
            </label>

            <label className="flex items-center justify-between">
              <div>
                <div className="font-medium">プッシュ通知</div>
                <div className="text-sm text-gray-500">ブラウザのプッシュ通知を受け取る</div>
              </div>
              <input
                type="checkbox"
                checked={formData.notificationPush}
                onChange={(e) => setFormData({ ...formData, notificationPush: e.target.checked })}
                className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
              />
            </label>

            <label className="flex items-center justify-between">
              <div>
                <div className="font-medium">ニュースレター</div>
                <div className="text-sm text-gray-500">新機能やお得な情報を受け取る</div>
              </div>
              <input
                type="checkbox"
                checked={formData.newsletter}
                onChange={(e) => setFormData({ ...formData, newsletter: e.target.checked })}
                className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
              />
            </label>
          </div>
        </div>

        {/* プライバシー設定 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-pink-500" />
            <h2 className="text-xl font-semibold">プライバシー設定</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <div className="font-medium">プロフィールを公開</div>
                <div className="text-sm text-gray-500">他のユーザーがあなたのプロフィールを閲覧できます</div>
              </div>
              <input
                type="checkbox"
                checked={formData.privacyPublic}
                onChange={(e) => setFormData({ ...formData, privacyPublic: e.target.checked })}
                className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
              />
            </label>
          </div>
        </div>

        {/* 保存ボタン */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/dashboard')}
          >
            キャンセル
          </Button>
          <Button
            type="submit"
            loading={loading}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            設定を保存
          </Button>
        </div>
      </form>

      {/* アカウント削除 */}
      <div className="mt-12 p-6 bg-red-50 rounded-xl border border-red-200">
        <h3 className="text-lg font-semibold text-red-800 mb-2">アカウントの削除</h3>
        <p className="text-sm text-red-700 mb-4">
          アカウントを削除すると、すべてのデータが永久に失われます。この操作は取り消せません。
        </p>
        <Button
          variant="secondary"
          className="bg-red-600 hover:bg-red-700 text-white"
          onClick={() => toast.error('この機能は現在利用できません')}
        >
          アカウントを削除
        </Button>
      </div>
    </div>
  )
}