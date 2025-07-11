'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export default function AgeGatePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleAgeConfirmation = async (isAdult: boolean) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/age-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAdult }),
      })
      
      const data = await response.json()
      
      if (data.redirect) {
        // 18歳未満の場合は外部サイトへリダイレクト
        window.location.href = data.redirect
      } else if (data.success) {
        // トップページへリダイレクト
        router.push('/')
      }
    } catch (error) {
      console.error('年齢確認エラー:', error)
      alert('エラーが発生しました。もう一度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            年齢確認
          </h1>
          <p className="text-gray-600 mb-2">
            このサイトにはアダルトコンテンツが含まれています。
          </p>
          <p className="text-gray-600">
            18歳以上の方のみご利用いただけます。
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => handleAgeConfirmation(true)}
            disabled={isLoading}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 text-lg font-semibold"
          >
            {isLoading ? '確認中...' : '18歳以上です'}
          </Button>
          
          <Button
            onClick={() => handleAgeConfirmation(false)}
            disabled={isLoading}
            variant="outline"
            className="w-full border-gray-300 text-gray-700 py-3 text-lg"
          >
            18歳未満です
          </Button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            年齢を偽って入場した場合、利用者の責任となります。
          </p>
          <p className="text-sm text-gray-500 mt-2">
            本サイトは日本国内向けのサービスです。
          </p>
          <p className="text-sm text-gray-500 mt-4">
            ご利用前に必ず
            <a href="/terms" target="_blank" className="text-pink-500 hover:text-pink-600 underline">利用規約</a>
            と
            <a href="/privacy" target="_blank" className="text-pink-500 hover:text-pink-600 underline">プライバシーポリシー</a>
            をご確認ください。
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Bachelo（バチェロ）
            </h2>
            <p className="text-sm text-gray-600">
              匿名音声掲示板 & アダルトボイスマーケットプレイス
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}