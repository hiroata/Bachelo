'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function VoiceBoardRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    // 音声カテゴリーIDを使用してリダイレクト
    router.replace('/board?category=d4e5f6a7-b8c9-0123-defa-456789012345')
  }, [router])
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
        <p className="text-gray-600">音声掲示板へ移動中...</p>
      </div>
    </div>
  )
}