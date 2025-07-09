'use client'

import { useState, useCallback } from 'react'
import { MessageCircle, Heart, DollarSign } from 'lucide-react'
import Link from 'next/link'
import AudioPlayer from './AudioPlayer'

interface VoicePost {
  id: string
  username: string
  avatarEmoji: string
  avatarColor: string
  message: string
  duration: number
  likes: number
  comments: number
  postedAt: string
  audioUrl: string
}

interface VoicePostCardProps {
  post: VoicePost
}

export default function VoicePostCard({ post }: VoicePostCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [playCount, setPlayCount] = useState(0)

  const handlePlay = useCallback(async () => {
    // 再生回数をカウント
    if (playCount === 0) {
      setPlayCount(1)
      // TODO: APIで再生回数を更新
    }
  }, [playCount])

  const handleLike = async () => {
    setIsLiked(!isLiked)
    // TODO: APIでいいねを更新
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-start space-x-3">
        {/* アバター */}
        <div className={`
          w-14 h-14 rounded-full flex items-center justify-center text-2xl
          ${post.avatarColor} text-white flex-shrink-0
        `}>
          {post.avatarEmoji}
        </div>

        {/* コンテンツ */}
        <div className="flex-1">
          {/* ユーザー名とメッセージ */}
          <div className="mb-3">
            <h3 className="font-bold text-gray-900">{post.username}</h3>
            <p className="text-gray-700 mt-1">{post.message}</p>
          </div>

          {/* 音声プレイヤー */}
          <div className="bg-gray-100 rounded-lg p-3 mb-3">
            <AudioPlayer 
              url={post.audioUrl} 
              duration={post.duration}
              onPlay={handlePlay}
            />
          </div>

          {/* アクションバー */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* コメント */}
              <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-800">
                <MessageCircle size={18} />
                <span className="text-sm">{post.comments}</span>
              </button>

              {/* いいね */}
              <button 
                onClick={handleLike}
                className={`flex items-center space-x-1 transition-colors ${
                  isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                }`}
              >
                <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                <span className="text-sm">{isLiked ? post.likes + 1 : post.likes}</span>
              </button>

              {/* 投稿時間 */}
              <span className="text-sm text-gray-500">@{post.postedAt}</span>
            </div>

            {/* 有料リクエストボタン */}
            <Link 
              href={`/request?creator=${post.username}`}
              className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <DollarSign size={14} />
              <span>リクエスト</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}