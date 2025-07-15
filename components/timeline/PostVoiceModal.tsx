'use client'

import { useState, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Mic, Square, Upload, X } from 'lucide-react'
import { Database } from '@/types/database'
import { getErrorMessage } from '@/lib/utils/error-handler'

interface PostVoiceModalProps {
  onClose: () => void
}

export default function PostVoiceModal({ onClose }: PostVoiceModalProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  const supabase = createClientComponentClient<Database>()
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      
      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data)
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      // タイマー開始
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 9) {
            stopRecording()
            return 10
          }
          return prev + 1
        })
      }, 1000)
      
    } catch (error) {
      toast.error('マイクへのアクセスが拒否されました')
    }
  }
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 1024 * 1024) {
        toast.error('ファイルサイズは1MB以下にしてください')
        return
      }
      setAudioBlob(file)
      setAudioUrl(URL.createObjectURL(file))
    }
  }
  
  const addTag = () => {
    if (tagInput && !tags.includes(tagInput) && tags.length < 5) {
      setTags([...tags, tagInput])
      setTagInput('')
    }
  }
  
  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }
  
  const uploadPost = async () => {
    if (!audioBlob || !title) {
      toast.error('タイトルと音声を入力してください')
      return
    }
    
    setIsUploading(true)
    
    try {
      // 音声ファイルをアップロード
      const formData = new FormData()
      formData.append('audio', audioBlob)
      formData.append('type', 'post')
      
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (!uploadResponse.ok) {
        throw new Error('アップロードに失敗しました')
      }
      
      const { audioUrl: uploadedUrl } = await uploadResponse.json()
      
      // 投稿を作成
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('ログインが必要です')
      
      const { error: postError } = await supabase
        .from('voice_posts')
        .insert({
          creator_id: user.id,
          title,
          description: description || null,
          audio_url: uploadedUrl,
          duration_seconds: recordingTime || 10,
          tags: tags.length > 0 ? tags : null,
        })
      
      if (postError) throw postError
      
      toast.success('投稿しました！')
      onClose()
      
    } catch (error: unknown) {
      toast.error(getErrorMessage(error))
      console.error(error)
    } finally {
      setIsUploading(false)
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">音声を投稿</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* タイトル入力 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            タイトル（必須・30文字まで）
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 30))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="例：優しい目覚ましボイス"
          />
          <p className="text-sm text-gray-500 mt-1">{title.length}/30</p>
        </div>
        
        {/* 説明入力 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            説明（任意・100文字まで）
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 100))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
            rows={2}
            placeholder="どんな音声か説明を追加"
          />
          <p className="text-sm text-gray-500 mt-1">{description.length}/100</p>
        </div>
        
        {/* 録音/アップロード */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            音声（最大10秒・1MB以下）
          </label>
          
          {!audioUrl && (
            <div className="space-y-2">
              {/* 録音ボタン */}
              <div className="text-center">
                {!isRecording ? (
                  <Button
                    onClick={startRecording}
                    variant="primary"
                    className="w-full"
                  >
                    <Mic className="mr-2" size={20} />
                    録音開始
                  </Button>
                ) : (
                  <div>
                    <div className="mb-2">
                      <div className="text-3xl font-bold text-pink-500">
                        {recordingTime}秒
                      </div>
                      <div className="text-sm text-gray-500">録音中...</div>
                    </div>
                    <Button
                      onClick={stopRecording}
                      variant="secondary"
                      className="w-full"
                    >
                      <Square className="mr-2" size={20} />
                      停止
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="text-center text-sm text-gray-500">または</div>
              
              {/* ファイル選択 */}
              <label className="block">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="w-full">
                  <Button variant="outline" className="w-full">
                    <Upload className="mr-2" size={20} />
                    ファイルを選択
                  </Button>
                </div>
              </label>
            </div>
          )}
          
          {audioUrl && (
            <div className="space-y-2">
              <audio controls src={audioUrl} className="w-full" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAudioBlob(null)
                  setAudioUrl(null)
                  setRecordingTime(0)
                }}
                className="w-full"
              >
                録り直す
              </Button>
            </div>
          )}
        </div>
        
        {/* タグ入力 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            タグ（最大5個）
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="タグを入力"
            />
            <Button
              variant="outline"
              onClick={addTag}
              disabled={!tagInput || tags.length >= 5}
            >
              追加
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 bg-gray-100 text-sm rounded-full"
              >
                #{tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
        
        {/* アクションボタン */}
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isUploading}
          >
            キャンセル
          </Button>
          <Button
            onClick={uploadPost}
            loading={isUploading}
            disabled={!audioBlob || !title}
          >
            投稿する
          </Button>
        </div>
      </div>
    </div>
  )
}