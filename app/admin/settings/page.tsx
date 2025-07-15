'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { toast } from 'react-hot-toast'
import { Save, Shield, Bell, Database, Mail, Clock, Users } from 'lucide-react'

interface SettingSection {
  id: string
  title: string
  icon: React.ReactNode
  description: string
}

const settingSections: SettingSection[] = [
  {
    id: 'general',
    title: '一般設定',
    icon: <Shield className="w-5 h-5" />,
    description: 'サイトの基本設定'
  },
  {
    id: 'notifications',
    title: '通知設定',
    icon: <Bell className="w-5 h-5" />,
    description: '管理者への通知設定'
  },
  {
    id: 'database',
    title: 'データベース',
    icon: <Database className="w-5 h-5" />,
    description: 'データベースの最適化と管理'
  },
  {
    id: 'email',
    title: 'メール設定',
    icon: <Mail className="w-5 h-5" />,
    description: '送信メールの設定'
  },
  {
    id: 'maintenance',
    title: 'メンテナンス',
    icon: <Clock className="w-5 h-5" />,
    description: 'メンテナンスモードの管理'
  },
  {
    id: 'users',
    title: 'ユーザー管理',
    icon: <Users className="w-5 h-5" />,
    description: 'ユーザー関連の設定'
  }
]

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [activeSection, setActiveSection] = useState('general')
  const [settings, setSettings] = useState({
    siteName: 'BACHELO',
    siteDescription: '匿名音声掲示板 & アダルトボイスマーケットプレイス',
    maintenanceMode: false,
    emailNotifications: true,
    autoCleanup: true,
    cleanupDays: 7,
    maxFileSize: 50,
    allowedFileTypes: 'mp3,wav,ogg,jpg,jpeg,png,gif',
    emailFrom: 'noreply@bachelo.com',
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    adminEmails: 'admin@bachelo.com',
    maxPostsPerUser: 5,
    requireEmailVerification: false,
    enableRateLimiting: true
  })

  const handleSave = async () => {
    setLoading(true)
    try {
      // TODO: Implement settings save logic
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('設定を保存しました')
    } catch (error) {
      toast.error('設定の保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const renderSettingContent = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                サイト名
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                サイト説明
              </label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                許可するファイルタイプ
              </label>
              <input
                type="text"
                value={settings.allowedFileTypes}
                onChange={(e) => setSettings({ ...settings, allowedFileTypes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                placeholder="mp3,wav,jpg,png"
              />
              <p className="text-sm text-gray-500 mt-1">カンマ区切りで拡張子を指定</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                最大ファイルサイズ (MB)
              </label>
              <input
                type="number"
                value={settings.maxFileSize}
                onChange={(e) => setSettings({ ...settings, maxFileSize: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                />
                <span className="text-gray-700">メール通知を有効にする</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                管理者メールアドレス
              </label>
              <textarea
                value={settings.adminEmails}
                onChange={(e) => setSettings({ ...settings, adminEmails: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                rows={3}
                placeholder="admin@example.com"
              />
              <p className="text-sm text-gray-500 mt-1">複数指定する場合は改行で区切ってください</p>
            </div>
          </div>
        )

      case 'database':
        return (
          <div className="space-y-6">
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.autoCleanup}
                  onChange={(e) => setSettings({ ...settings, autoCleanup: e.target.checked })}
                  className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                />
                <span className="text-gray-700">自動クリーンアップを有効にする</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                投稿を削除するまでの日数
              </label>
              <input
                type="number"
                value={settings.cleanupDays}
                onChange={(e) => setSettings({ ...settings, cleanupDays: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                disabled={!settings.autoCleanup}
              />
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>注意:</strong> データベースのバックアップは定期的に行ってください。
              </p>
            </div>
          </div>
        )

      case 'email':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                送信元メールアドレス
              </label>
              <input
                type="email"
                value={settings.emailFrom}
                onChange={(e) => setSettings({ ...settings, emailFrom: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTPホスト
                </label>
                <input
                  type="text"
                  value={settings.smtpHost}
                  onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTPポート
                </label>
                <input
                  type="number"
                  value={settings.smtpPort}
                  onChange={(e) => setSettings({ ...settings, smtpPort: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTPユーザー名
              </label>
              <input
                type="text"
                value={settings.smtpUser}
                onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTPパスワード
              </label>
              <input
                type="password"
                value={settings.smtpPassword}
                onChange={(e) => setSettings({ ...settings, smtpPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>
        )

      case 'maintenance':
        return (
          <div className="space-y-6">
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                />
                <span className="text-gray-700">メンテナンスモードを有効にする</span>
              </label>
              <p className="text-sm text-gray-500 mt-2">
                有効にすると、管理者以外のユーザーはサイトにアクセスできなくなります。
              </p>
            </div>
            {settings.maintenanceMode && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  <strong>警告:</strong> メンテナンスモードが有効です。一般ユーザーはサイトにアクセスできません。
                </p>
              </div>
            )}
          </div>
        )

      case 'users':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ユーザーあたりの最大投稿数（1分間）
              </label>
              <input
                type="number"
                value={settings.maxPostsPerUser}
                onChange={(e) => setSettings({ ...settings, maxPostsPerUser: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.requireEmailVerification}
                  onChange={(e) => setSettings({ ...settings, requireEmailVerification: e.target.checked })}
                  className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                />
                <span className="text-gray-700">メールアドレス確認を必須にする</span>
              </label>
            </div>
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.enableRateLimiting}
                  onChange={(e) => setSettings({ ...settings, enableRateLimiting: e.target.checked })}
                  className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                />
                <span className="text-gray-700">レート制限を有効にする</span>
              </label>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">システム設定</h1>
        <Button
          onClick={handleSave}
          loading={loading}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          設定を保存
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* サイドバー */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {settingSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeSection === section.id
                    ? 'bg-pink-50 text-pink-700 border-l-4 border-pink-500'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {section.icon}
                <div>
                  <div className="font-medium">{section.title}</div>
                  <div className="text-xs text-gray-500">{section.description}</div>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* メインコンテンツ */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {settingSections.find(s => s.id === activeSection)?.title}
            </h2>
            {renderSettingContent()}
          </div>
        </div>
      </div>
    </div>
  )
}