import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Database } from '@/types/database'

const createOrderSchema = z.object({
  creatorId: z.string().uuid(),
  script: z.string().min(1).max(100),
  notes: z.string().max(200).optional(),
})

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  
  // 認証確認
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // リクエストボディ検証
  const body = await request.json()
  const validationResult = createOrderSchema.safeParse(body)
  
  if (!validationResult.success) {
    return NextResponse.json({ error: validationResult.error }, { status: 400 })
  }
  
  const { creatorId, script, notes } = validationResult.data
  
  // クリエイター情報取得
  const { data: creator } = await supabase
    .from('profiles')
    .select('price_per_10sec, is_accepting_orders')
    .eq('id', creatorId)
    .eq('role', 'creator')
    .single()
  
  if (!creator) {
    return NextResponse.json({ error: 'クリエイターが見つかりません' }, { status: 404 })
  }
  
  if (!creator.is_accepting_orders) {
    return NextResponse.json({ error: '現在注文を受け付けていません' }, { status: 400 })
  }
  
  if (!creator.price_per_10sec) {
    return NextResponse.json({ error: '価格が設定されていません' }, { status: 400 })
  }
  
  // 決済処理（MVP版では実際の決済は行わず、モックとして処理）
  const paymentResult = await processPayment({
    amount: creator.price_per_10sec,
    clientId: user.id,
    orderId: crypto.randomUUID(),
  })
  
  if (!paymentResult.success) {
    return NextResponse.json({ error: '決済に失敗しました' }, { status: 400 })
  }
  
  // 注文作成
  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      client_id: user.id,
      creator_id: creatorId,
      script,
      notes,
      price: creator.price_per_10sec,
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single()
  
  if (error) {
    // 決済をキャンセル（実際の実装では必要）
    await cancelPayment(paymentResult.paymentId)
    return NextResponse.json({ error: '注文作成に失敗しました' }, { status: 500 })
  }
  
  // 取引記録作成
  await supabase
    .from('transactions')
    .insert({
      order_id: order.id,
      amount: creator.price_per_10sec,
      platform_fee: Math.floor(creator.price_per_10sec * 0.2), // 20%手数料
      creator_amount: Math.floor(creator.price_per_10sec * 0.8),
      payment_provider: 'mock', // 実際の決済プロバイダー名
      payment_id: paymentResult.paymentId,
      status: 'completed',
    })
  
  return NextResponse.json({ order })
}

// 決済処理のモック（実際はSPIKE等のAPIを使用）
async function processPayment(params: {
  amount: number
  clientId: string
  orderId: string
}) {
  // TODO: 実際の決済API実装
  // MVP版では常に成功を返す
  return {
    success: true,
    paymentId: `pay_${crypto.randomUUID()}`
  }
}

async function cancelPayment(paymentId: string) {
  // TODO: 決済キャンセル処理
  console.log('Payment cancelled:', paymentId)
}

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // ユーザーの役割に応じて注文を取得
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }
  
  let query = supabase
    .from('orders')
    .select(`
      *,
      client:profiles!orders_client_id_fkey(username, display_name, avatar_url),
      creator:profiles!orders_creator_id_fkey(username, display_name, avatar_url)
    `)
  
  if (profile.role === 'creator') {
    query = query.eq('creator_id', user.id)
  } else {
    query = query.eq('client_id', user.id)
  }
  
  const { data: orders, error } = await query.order('created_at', { ascending: false })
  
  if (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
  
  return NextResponse.json({ orders })
}