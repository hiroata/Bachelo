'use client'

import { useState, useRef } from 'react'
import { X, Upload, Mic, Play } from 'lucide-react'
import { voicePostSchema } from '@/lib/validations/voice-post'
import { handleError } from '@/lib/utils/error-handler'
import { toast } from 'react-hot-toast'
import { z } from 'zod'

interface UploadModalProps {
  onClose: () => void
}

export default function UploadModal({ onClose }: UploadModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<'female' | 'male' | 'couple'>('female')
  const [message, setMessage] = useState('')
  const [nickname, setNickname] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const generateRandomNickname = () => {
    const adjectives = ['甘い', '優しい', 'セクシー', '可愛い', '大人の', '魅惑の']
    const nouns = ['声', 'ボイス', '囁き', '吐息', 'トーク', 'サウンド']
    const random = Math.floor(Math.random() * 1000)
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
    const noun = nouns[Math.floor(Math.random() * nouns.length)]
    setNickname(`${adj}${noun}${random}`)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file)
      
      // 音声ファイルの長さを取得
      try {
        const audio = new Audio()
        const objectUrl = URL.createObjectURL(file)
        
        await new Promise((resolve) => {
          audio.addEventListener('loadedmetadata', () => {
            // TODO: duration を状態として保持し、アップロード時に送信
            console.log('Audio duration:', Math.round(audio.duration))
            URL.revokeObjectURL(objectUrl)
            resolve(null)
          })
          audio.src = objectUrl
        })
      } catch (error) {
        console.error('Failed to get audio duration:', error)
      }
    }
  }

  const handleSubmit = async () => {
    if (!audioFile) {
      toast.error('音声ファイルを選択してください')
      return
    }

    const finalNickname = nickname || `匿名${Math.floor(Math.random() * 10000)}`

    // バリデーション
    try {
      const validationData = {
        category: selectedCategory,
        nickname: finalNickname,
        message,
        audioFile
      }
      
      voicePostSchema.parse(validationData)
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message)
      } else {
        toast.error('入力内容を確認してください')
      }
      return
    }

    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('category', selectedCategory)
      formData.append('nickname', finalNickname)
      formData.append('message', message)
      formData.append('audio', audioFile)
      
      const response = await fetch('/api/voice/upload', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success('投稿が完了しました！')
        onClose()
      } else {
        toast.error(data.error || '投稿に失敗しました')
      }
    } catch (error) {
      handleError(error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex justify-between items-center">
          <h2 className="text-lg font-bold">匿名で音声を投稿</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* カテゴリー選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリー
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setSelectedCategory('female')}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === 'female'
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                女性の声
              </button>
              <button
                onClick={() => setSelectedCategory('male')}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === 'male'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                男性の声
              </button>
              <button
                onClick={() => setSelectedCategory('couple')}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === 'couple'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                カップルの声
              </button>
            </div>
          </div>

          {/* ニックネーム */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ニックネーム（匿名）
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="例: 甘い声123"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button
                onClick={generateRandomNickname}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
              >
                ランダム生成
              </button>
            </div>
          </div>

          {/* メッセージ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メッセージ（タイトル）
            </label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="例: 優しく囁きます"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">{message.length}/50</p>
          </div>

          {/* 音声アップロード */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              音声ファイル
            </label>
            
            {audioFile ? (
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white">
                      <Play size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{audioFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAudioFile(null)}
                    className="text-red-500 hover:text-red-600"
                  >
                    削除
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-pink-500 transition-colors flex flex-col items-center space-y-2"
                >
                  <Upload size={32} className="text-gray-400" />
                  <span className="text-sm text-gray-600">
                    クリックして音声ファイルを選択
                  </span>
                  <span className="text-xs text-gray-500">
                    MP3, WAV, M4A (最大10MB)
                  </span>
                </button>
                
                <div className="text-center text-gray-500 text-sm">または</div>
                
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                    isRecording
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Mic size={20} />
                  <span>{isRecording ? '録音停止' : '録音開始'}</span>
                </button>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* 利用規約 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              投稿することで、利用規約に同意したものとみなされます。
              違法・有害なコンテンツの投稿は禁止されています。
            </p>
          </div>

          {/* 送信ボタン */}
          <button
            onClick={handleSubmit}
            disabled={isUploading || !message || !audioFile}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              isUploading || !message || !audioFile
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-pink-500 text-white hover:bg-pink-600'
            }`}
          >
            {isUploading ? '投稿中...' : '匿名で投稿する'}
          </button>
        </div>
      </div>
    </div>
  )
}