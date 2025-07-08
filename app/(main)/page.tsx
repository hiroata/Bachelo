'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Mic, MessageSquare, Users } from 'lucide-react'

export default function HomePage() {
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            VoiceEros へようこそ
          </h1>
          <p className="text-xl text-gray-600">
            匿名で楽しめる音声投稿プラットフォーム
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Link href="/voice-board">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer">
              <div className="flex justify-center mb-4">
                <Mic className="w-16 h-16 text-pink-500" />
              </div>
              <h2 className="text-2xl font-semibold text-center mb-2">
                音声掲示板
              </h2>
              <p className="text-gray-600 text-center">
                匿名で音声を投稿・視聴できます
              </p>
            </div>
          </Link>

          <Link href="/board">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer">
              <div className="flex justify-center mb-4">
                <MessageSquare className="w-16 h-16 text-pink-500" />
              </div>
              <h2 className="text-2xl font-semibold text-center mb-2">
                掲示板
              </h2>
              <p className="text-gray-600 text-center">
                テキストと画像で交流できます
              </p>
            </div>
          </Link>

          <Link href="/creators">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer">
              <div className="flex justify-center mb-4">
                <Users className="w-16 h-16 text-pink-500" />
              </div>
              <h2 className="text-2xl font-semibold text-center mb-2">
                クリエイター
              </h2>
              <p className="text-gray-600 text-center">
                お気に入りのクリエイターを見つけよう
              </p>
            </div>
          </Link>
        </div>

        <div className="text-center mt-12">
          <Link href="/register">
            <Button size="lg" className="mr-4">
              新規登録
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              ログイン
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}