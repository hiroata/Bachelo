'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/hooks/useAuth'
import { Database } from '@/types/database'
import { Button } from '@/components/ui/Button'
import { Clock, CheckCircle, XCircle, Upload, Play } from 'lucide-react'
import toast from 'react-hot-toast'

type Order = Database['public']['Tables']['orders']['Row'] & {
  client: Pick<Database['public']['Tables']['profiles']['Row'], 'username' | 'display_name' | 'avatar_url'>
  creator: Pick<Database['public']['Tables']['profiles']['Row'], 'username' | 'display_name' | 'avatar_url'>
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [uploading, setUploading] = useState(false)
  const { profile } = useAuth()
  const supabase = createClientComponentClient<Database>()
  
  const isCreator = profile?.role === 'creator'
  
  useEffect(() => {
    fetchOrders()
  }, [])
  
  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (!response.ok) throw new Error('Failed to fetch orders')
      
      const { orders } = await response.json()
      setOrders(orders)
    } catch (error) {
      toast.error('注文の取得に失敗しました')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleFileUpload = async (orderId: string, file: File) => {
    setUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('audio', file)
      formData.append('orderId', orderId)
      formData.append('type', 'order')
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'アップロードに失敗しました')
      }
      
      toast.success('音声ファイルをアップロードしました')
      fetchOrders() // リロード
      setSelectedOrder(null)
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || 'アップロードに失敗しました')
      } else {
        toast.error('アップロードに失敗しました')
      }
    } finally {
      setUploading(false)
    }
  }
  
  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
      
      if (error) throw error
      
      toast.success('ステータスを更新しました')
      fetchOrders()
    } catch (error) {
      toast.error('ステータスの更新に失敗しました')
      console.error(error)
    }
  }
  
  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: '承認待ち', icon: Clock },
      accepted: { color: 'bg-blue-100 text-blue-800', label: '承認済み', icon: CheckCircle },
      recording: { color: 'bg-purple-100 text-purple-800', label: '収録中', icon: Clock },
      delivered: { color: 'bg-green-100 text-green-800', label: '納品済み', icon: CheckCircle },
      completed: { color: 'bg-gray-100 text-gray-800', label: '完了', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'キャンセル', icon: XCircle },
    }
    
    const badge = badges[status as keyof typeof badges] || badges.pending
    const Icon = badge.icon
    
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon size={14} />
        <span>{badge.label}</span>
      </span>
    )
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          {isCreator ? '受注管理' : '注文履歴'}
        </h1>
        
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">
              {isCreator ? 'まだ注文がありません' : 'まだ注文していません'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        {isCreator ? 'クライアント' : 'クリエイター'}
                      </p>
                      <p className="font-semibold">
                        {isCreator ? order.client.display_name : order.creator.display_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        @{isCreator ? order.client.username : order.creator.username}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {getStatusBadge(order.status)}
                    <p className="mt-2 text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">台本</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">
                    {order.script}
                  </p>
                  
                  {order.notes && (
                    <div className="mt-3">
                      <h4 className="font-medium mb-2">追加リクエスト</h4>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded">
                        {order.notes}
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-lg font-semibold">
                      ¥{order.price.toLocaleString()}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {isCreator && order.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          >
                            拒否
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, 'accepted')}
                          >
                            承認
                          </Button>
                        </>
                      )}
                      
                      {isCreator && (order.status === 'accepted' || order.status === 'recording') && (
                        <Button
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Upload size={16} className="mr-1" />
                          音声アップロード
                        </Button>
                      )}
                      
                      {order.audio_url && (
                        <audio controls className="h-8">
                          <source src={order.audio_url} type="audio/mpeg" />
                          お使いのブラウザは音声再生に対応していません
                        </audio>
                      )}
                      
                      {!isCreator && order.status === 'delivered' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'completed')}
                        >
                          完了確認
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* アップロードモーダル */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">音声ファイルのアップロード</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">台本:</p>
              <p className="bg-gray-50 p-3 rounded text-sm">{selectedOrder.script}</p>
            </div>
            
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  handleFileUpload(selectedOrder.id, file)
                }
              }}
              className="mb-4 w-full"
              disabled={uploading}
            />
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setSelectedOrder(null)}
                disabled={uploading}
              >
                キャンセル
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}