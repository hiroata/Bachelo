'use client'

import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { Button } from './Button'
import toast from 'react-hot-toast'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  contentType: 'voice_post' | 'board_post' | 'board_reply'
  contentId: string
}

const reportReasons = [
  { value: 'illegal_content', label: '違法なコンテンツ' },
  { value: 'child_abuse', label: '児童の性的虐待・児童ポルノ' },
  { value: 'harassment', label: 'ハラスメント・いじめ' },
  { value: 'spam', label: 'スパム' },
  { value: 'copyright', label: '著作権侵害' },
  { value: 'personal_info', label: '個人情報の掲載' },
  { value: 'violence', label: '暴力的なコンテンツ' },
  { value: 'other', label: 'その他' }
]

export function ReportModal({ isOpen, onClose, contentType, contentId }: ReportModalProps) {
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!reason) {
      toast.error('通報理由を選択してください')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentType,
          contentId,
          reason,
          description
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '通報の送信に失敗しました')
      }

      toast.success('通報を受け付けました。ご協力ありがとうございます。')
      onClose()
      setReason('')
      setDescription('')
    } catch (error) {
      console.error('通報エラー:', error)
      toast.error(error instanceof Error ? error.message : '通報の送信に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <AlertTriangle className="text-red-500 mr-2" size={24} />
            コンテンツを通報
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            虚偽の通報や嫌がらせ目的の通報は禁止されています。
            悪質な場合はアクセス制限の対象となります。
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              通報理由 <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            >
              <option value="">選択してください</option>
              {reportReasons.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              詳細（任意）
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="通報理由の詳細を記入してください（任意）"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {description.length}/500文字
            </p>
          </div>

          <div className="flex space-x-3">
            <Button
              type="submit"
              disabled={isSubmitting || !reason}
              className="flex-1"
            >
              {isSubmitting ? '送信中...' : '通報する'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              キャンセル
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}