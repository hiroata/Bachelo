'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, XCircle, Clock, Eye } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Report {
  id: string
  content_type: 'voice_post' | 'board_post' | 'board_reply'
  content_id: string
  reason: string
  description: string | null
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
  reporter_ip_hash: string
  admin_notes: string | null
  created_at: string
  resolved_at: string | null
}

const reasonLabels: Record<string, string> = {
  illegal_content: '違法なコンテンツ',
  child_abuse: '児童の性的虐待・児童ポルノ',
  harassment: 'ハラスメント・いじめ',
  spam: 'スパム',
  copyright: '著作権侵害',
  personal_info: '個人情報の掲載',
  violence: '暴力的なコンテンツ',
  other: 'その他'
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: '未対応', color: 'bg-yellow-100 text-yellow-800' },
  reviewing: { label: '確認中', color: 'bg-blue-100 text-blue-800' },
  resolved: { label: '対応済み', color: 'bg-green-100 text-green-800' },
  dismissed: { label: '却下', color: 'bg-gray-100 text-gray-800' }
}

export default function ModerationPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('pending')
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [adminNotes, setAdminNotes] = useState('')

  // 通報一覧を取得
  const fetchReports = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        status: selectedStatus,
        per_page: '50'
      })
      
      const response = await fetch(`/api/reports?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setReports(data.reports || [])
      } else {
        throw new Error(data.error || '通報一覧の取得に失敗しました')
      }
    } catch (error) {
      console.error('通報取得エラー:', error)
      toast.error('通報一覧の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [selectedStatus])

  // 通報のステータスを更新
  const updateReportStatus = async (reportId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          adminNotes
        })
      })

      if (!response.ok) {
        throw new Error('ステータスの更新に失敗しました')
      }

      toast.success('ステータスを更新しました')
      setSelectedReport(null)
      setAdminNotes('')
      fetchReports()
    } catch (error) {
      console.error('更新エラー:', error)
      toast.error('ステータスの更新に失敗しました')
    }
  }

  // コンテンツの詳細を表示
  const viewContent = (report: Report) => {
    // コンテンツタイプに応じて適切なURLに遷移
    let url = ''
    if (report.content_type === 'board_post') {
      url = `/board/post/${report.content_id}`
    } else if (report.content_type === 'voice_post') {
      url = `/voice-board#${report.content_id}`
    }
    
    if (url) {
      window.open(url, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          {/* ヘッダー */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <AlertTriangle className="text-orange-500 mr-2" size={28} />
              通報管理
            </h1>
          </div>

          {/* ステータスフィルター */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex space-x-4">
              {Object.entries(statusLabels).map(([status, { label }]) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedStatus === status
                      ? 'bg-pink-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedStatus === 'all'
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                すべて
              </button>
            </div>
          </div>

          {/* 通報リスト */}
          <div className="px-6 py-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
              </div>
            ) : reports.length === 0 ? (
              <p className="text-center py-12 text-gray-500">
                該当する通報はありません
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        日時
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        コンテンツ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        理由
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ステータス
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        アクション
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(report.created_at).toLocaleString('ja-JP')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.content_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {reasonLabels[report.reason] || report.reason}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusLabels[report.status].color}`}>
                            {statusLabels[report.status].label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => viewContent(report)}
                            className="text-blue-600 hover:text-blue-900"
                            title="コンテンツを表示"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => setSelectedReport(report)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            対応
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* 対応モーダル */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <h2 className="text-xl font-bold mb-4">通報への対応</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">通報理由</p>
                  <p className="font-medium">{reasonLabels[selectedReport.reason]}</p>
                </div>
                
                {selectedReport.description && (
                  <div>
                    <p className="text-sm text-gray-600">詳細</p>
                    <p className="text-gray-900">{selectedReport.description}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    管理者メモ
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="対応内容をメモしてください"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setSelectedReport(null)
                    setAdminNotes('')
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => updateReportStatus(selectedReport.id, 'reviewing')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
                >
                  <Clock size={16} className="mr-1" />
                  確認中
                </button>
                <button
                  onClick={() => updateReportStatus(selectedReport.id, 'resolved')}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center"
                >
                  <CheckCircle size={16} className="mr-1" />
                  対応済み
                </button>
                <button
                  onClick={() => updateReportStatus(selectedReport.id, 'dismissed')}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center"
                >
                  <XCircle size={16} className="mr-1" />
                  却下
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}