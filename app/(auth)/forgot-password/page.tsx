'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { toast } from 'react-hot-toast'
import { Mail, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('メールアドレスを入力してください')
      return
    }

    setLoading(true)
    
    try {
      // TODO: Implement password reset logic with Supabase
      // const { data, error } = await supabase.auth.resetPasswordForEmail(email)
      
      // For now, just simulate the request
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setSent(true)
      toast.success('パスワードリセットメールを送信しました')
    } catch (error) {
      console.error('Password reset error:', error)
      toast.error('エラーが発生しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            メールを送信しました
          </h2>
          <p className="text-gray-600 mb-6">
            {email} 宛にパスワードリセット用のリンクを送信しました。
            メールボックスをご確認ください。
          </p>
          <div className="space-y-4">
            <Link href="/login">
              <Button variant="primary" className="w-full">
                ログインページに戻る
              </Button>
            </Link>
            <button
              onClick={() => {
                setSent(false)
                setEmail('')
              }}
              className="text-sm text-pink-600 hover:text-pink-700"
            >
              別のメールアドレスで試す
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <Link
          href="/login"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          ログインに戻る
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          パスワードをお忘れですか？
        </h1>
        <p className="text-gray-600 mb-8">
          登録時のメールアドレスを入力してください。
          パスワードリセット用のリンクをお送りします。
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="your@email.com"
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={loading}
          >
            リセットリンクを送信
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            アカウントをお持ちでない方は
            <Link href="/register" className="text-pink-600 hover:text-pink-700 font-medium ml-1">
              新規登録
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}