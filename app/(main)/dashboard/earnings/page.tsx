'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/hooks/useAuth'
import { Database } from '@/types/database'
import { DollarSign, TrendingUp, Calendar, Download } from 'lucide-react'
import toast from 'react-hot-toast'

type Transaction = Database['public']['Tables']['transactions']['Row'] & {
  order: Database['public']['Tables']['orders']['Row']
}

export default function EarningsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEarnings: 0,
    thisMonthEarnings: 0,
    pendingEarnings: 0,
    completedOrders: 0,
  })
  const { user, profile } = useAuth()
  const supabase = createClientComponentClient<Database>()
  
  useEffect(() => {
    if (profile?.role !== 'creator') {
      toast.error('クリエイター専用のページです')
      return
    }
    
    fetchEarnings()
  }, [profile])
  
  const fetchEarnings = async () => {
    if (!user) return
    
    try {
      // 取引データを取得
      const { data: transactionsData, error: transError } = await supabase
        .from('transactions')
        .select(`
          *,
          order:orders!inner(*)
        `)
        .eq('order.creator_id', user.id)
        .order('created_at', { ascending: false })
      
      if (transError) throw transError
      
      setTransactions(transactionsData || [])
      
      // 統計を計算
      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      let totalEarnings = 0
      let thisMonthEarnings = 0
      let pendingEarnings = 0
      let completedOrders = 0
      
      transactionsData?.forEach((transaction) => {
        if (transaction.status === 'completed') {
          totalEarnings += transaction.creator_amount
          completedOrders++
          
          const transDate = new Date(transaction.created_at)
          if (transDate >= thisMonth) {
            thisMonthEarnings += transaction.creator_amount
          }
        } else if (transaction.status === 'pending') {
          pendingEarnings += transaction.creator_amount
        }
      })
      
      setStats({
        totalEarnings,
        thisMonthEarnings,
        pendingEarnings,
        completedOrders,
      })
    } catch (error) {
      toast.error('売上データの取得に失敗しました')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }
  
  if (profile?.role !== 'creator') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">クリエイター専用のページです</p>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">売上管理</h1>
          <button className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <Download size={20} />
            <span>CSVダウンロード</span>
          </button>
        </div>
        
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="総売上"
            value={`¥${stats.totalEarnings.toLocaleString()}`}
            icon={DollarSign}
            color="bg-green-500"
          />
          <StatCard
            title="今月の売上"
            value={`¥${stats.thisMonthEarnings.toLocaleString()}`}
            icon={Calendar}
            color="bg-blue-500"
          />
          <StatCard
            title="未確定"
            value={`¥${stats.pendingEarnings.toLocaleString()}`}
            icon={TrendingUp}
            color="bg-yellow-500"
          />
          <StatCard
            title="完了注文数"
            value={stats.completedOrders.toString()}
            icon={DollarSign}
            color="bg-purple-500"
          />
        </div>
        
        {/* 取引履歴 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">取引履歴</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    日付
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    注文ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    売上
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    手数料
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    受取額
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.order_id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ¥{transaction.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ¥{transaction.platform_fee.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ¥{transaction.creator_amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : transaction.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status === 'completed' ? '確定' : 
                         transaction.status === 'pending' ? '保留中' : '失敗'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {transactions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                まだ取引履歴がありません
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  icon: React.ElementType
  color: string
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color} text-white`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  )
}