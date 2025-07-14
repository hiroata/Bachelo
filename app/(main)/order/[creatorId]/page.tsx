'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { Database } from '@/types/database'
import { AlertCircle } from 'lucide-react'

const orderSchema = z.object({
  script: z.string()
    .min(1, '台本を入力してください')
    .max(100, '台本は100文字以内で入力してください'),
  notes: z.string().max(200, 'ノートは200文字以内で入力してください').optional(),
  agreement: z.boolean().refine(val => val === true, {
    message: '利用規約に同意する必要があります',
  }),
})

type OrderForm = z.infer<typeof orderSchema>
type Creator = Database['public']['Tables']['profiles']['Row']

interface PageProps {
  params: {
    creatorId: string
  }
}

export default function OrderPage({ params }: PageProps) {
  const [creator, setCreator] = useState<Creator | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [scriptLength, setScriptLength] = useState(0)
  const router = useRouter()
  const { user, profile } = useAuth()
  const supabase = createClientComponentClient<Database>()
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<OrderForm>({
    resolver: zodResolver(orderSchema)
  })
  
  const watchScript = watch('script', '')
  
  useEffect(() => {
    setScriptLength(watchScript?.length || 0)
  }, [watchScript])
  
  useEffect(() => {
    const fetchCreator = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', params.creatorId)
        .eq('role', 'creator')
        .single()
      
      if (data) {
        setCreator(data)
      } else {
        toast.error('クリエイターが見つかりません')
        router.push('/')
      }
    }
    
    fetchCreator()
  }, [params.creatorId, supabase, router])
  
  useEffect(() => {
    if (!user) {
      toast.error('ログインが必要です')
      router.push('/login')
    } else if (profile?.role !== 'client') {
      toast.error('クライアントアカウントでログインしてください')
      router.push('/')
    }
  }, [user, profile, router])
  
  const onSubmit = async (data: OrderForm) => {
    if (!creator || !user) return
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creatorId: creator.id,
          script: data.script,
          notes: data.notes,
        }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '注文の作成に失敗しました')
      }
      
      const { order } = await response.json()
      
      toast.success('注文が完了しました！')
      router.push(`/dashboard/orders`)
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || '注文の作成に失敗しました')
      } else {
        toast.error('注文の作成に失敗しました')
      }
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }
  
  if (!creator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">ボイスオーダー</h1>
        
        {/* クリエイター情報 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center space-x-4">
            {creator.avatar_url ? (
              <img
                src={creator.avatar_url}
                alt={creator.display_name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white text-xl font-bold">
                {creator.display_name[0]}
              </div>
            )}
            
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{creator.display_name}</h2>
              <p className="text-gray-500">@{creator.username}</p>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-pink-500">
                ¥{creator.price_per_10sec?.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">10秒</div>
            </div>
          </div>
        </div>
        
        {/* 注文フォーム */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">台本入力</h3>
            
            <div>
              <label htmlFor="script" className="block text-sm font-medium text-gray-700 mb-2">
                読み上げてもらいたい台本（10秒程度）
              </label>
              <textarea
                id="script"
                {...register('script')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                placeholder="例：お疲れ様。今日も一日頑張ったね。ゆっくり休んで。"
              />
              <div className="mt-1 flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  {scriptLength}/100文字
                </p>
                {errors.script && (
                  <p className="text-sm text-red-600">{errors.script.message}</p>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                追加のリクエスト（任意）
              </label>
              <textarea
                id="notes"
                {...register('notes')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                placeholder="例：優しい感じで読んでください"
              />
              {errors.notes && (
                <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
              )}
            </div>
          </div>
          
          {/* 注意事項 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="text-yellow-600 mt-0.5 mr-2" size={20} />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">ご注意ください</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>音声は10秒以内で収録されます</li>
                  <li>過度に性的な表現や違法な内容は禁止です</li>
                  <li>納品後のキャンセル・返金はできません</li>
                  <li>納期は通常{creator.average_delivery_hours || 24}時間以内です</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* 利用規約同意 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start">
              <input
                id="agreement"
                type="checkbox"
                {...register('agreement')}
                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded mt-0.5"
              />
              <label htmlFor="agreement" className="ml-2 text-sm text-gray-700">
                <a href="/terms" className="text-pink-600 hover:text-pink-500">利用規約</a>
                に同意して注文します
              </label>
            </div>
            {errors.agreement && (
              <p className="mt-1 text-sm text-red-600 ml-6">{errors.agreement.message}</p>
            )}
          </div>
          
          {/* 支払い情報 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">お支払い</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>ボイス料金</span>
                <span>¥{creator.price_per_10sec?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>システム利用料</span>
                <span>¥0</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold text-lg">
                  <span>合計</span>
                  <span className="text-pink-500">¥{creator.price_per_10sec?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          <Button
            type="submit"
            loading={isLoading}
            size="lg"
            className="w-full"
          >
            注文を確定する
          </Button>
        </form>
      </div>
    </div>
  )
}