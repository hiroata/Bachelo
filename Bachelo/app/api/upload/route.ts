import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/types/database'
import { SupabaseClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  
  // 認証確認
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const formData = await request.formData()
  const file = formData.get('audio') as File
  const orderId = formData.get('orderId') as string
  const type = formData.get('type') as string // 'order' or 'post'
  
  if (!file) {
    return NextResponse.json({ error: 'ファイルが必要です' }, { status: 400 })
  }
  
  // ファイルサイズチェック（1MB以下）
  if (file.size > 1024 * 1024) {
    return NextResponse.json({ error: 'ファイルサイズは1MB以下にしてください' }, { status: 400 })
  }
  
  // ファイルタイプチェック
  const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: '音声ファイルをアップロードしてください' }, { status: 400 })
  }
  
  try {
    if (type === 'order' && orderId) {
      // 注文の音声アップロード
      return await handleOrderUpload(supabase, user.id, orderId, file)
    } else if (type === 'post') {
      // 投稿用の音声アップロード
      return await handlePostUpload(supabase, user.id, file)
    } else {
      return NextResponse.json({ error: '無効なアップロードタイプです' }, { status: 400 })
    }
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'アップロードに失敗しました' }, { status: 500 })
  }
}

async function handleOrderUpload(
  supabase: SupabaseClient<Database>,
  userId: string,
  orderId: string,
  file: File
) {
  // 注文の所有権確認
  const { data: order } = await supabase
    .from('orders')
    .select('creator_id, status')
    .eq('id', orderId)
    .single()
  
  if (!order) {
    return NextResponse.json({ error: '注文が見つかりません' }, { status: 404 })
  }
  
  if (order.creator_id !== userId) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }
  
  if (order.status === 'completed' || order.status === 'cancelled') {
    return NextResponse.json({ error: 'この注文は既に完了またはキャンセルされています' }, { status: 400 })
  }
  
  // ファイル名生成
  const fileName = `orders/${orderId}_${Date.now()}.${file.name.split('.').pop()}`
  
  // Supabase Storageにアップロード
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('audio')
    .upload(fileName, file, {
      contentType: file.type,
      cacheControl: '3600',
    })
  
  if (uploadError) {
    console.error('Storage upload error:', uploadError)
    return NextResponse.json({ error: 'アップロードに失敗しました' }, { status: 500 })
  }
  
  // 24時間有効な署名付きURLを生成
  const { data: urlData } = await supabase.storage
    .from('audio')
    .createSignedUrl(fileName, 86400)
  
  if (!urlData?.signedUrl) {
    return NextResponse.json({ error: 'URLの生成に失敗しました' }, { status: 500 })
  }
  
  // 注文を更新
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      audio_url: urlData.signedUrl,
      status: 'delivered',
      delivered_at: new Date().toISOString(),
    })
    .eq('id', orderId)
  
  if (updateError) {
    console.error('Order update error:', updateError)
    return NextResponse.json({ error: '注文の更新に失敗しました' }, { status: 500 })
  }
  
  return NextResponse.json({ 
    success: true, 
    audioUrl: urlData.signedUrl,
    message: '音声ファイルが正常にアップロードされました'
  })
}

async function handlePostUpload(
  supabase: SupabaseClient<Database>,
  userId: string,
  file: File
) {
  // クリエイターかどうか確認
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  
  if (profile?.role !== 'creator') {
    return NextResponse.json({ error: 'クリエイターのみ投稿できます' }, { status: 403 })
  }
  
  // ファイル名生成
  const fileName = `posts/${userId}_${Date.now()}.${file.name.split('.').pop()}`
  
  // Supabase Storageにアップロード
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('audio')
    .upload(fileName, file, {
      contentType: file.type,
      cacheControl: '3600',
    })
  
  if (uploadError) {
    console.error('Storage upload error:', uploadError)
    return NextResponse.json({ error: 'アップロードに失敗しました' }, { status: 500 })
  }
  
  // 公開URLを生成（7日間有効）
  const { data: urlData } = await supabase.storage
    .from('audio')
    .createSignedUrl(fileName, 604800) // 7 days
  
  if (!urlData?.signedUrl) {
    return NextResponse.json({ error: 'URLの生成に失敗しました' }, { status: 500 })
  }
  
  return NextResponse.json({ 
    success: true, 
    audioUrl: urlData.signedUrl,
    fileName: fileName,
    message: '音声ファイルが正常にアップロードされました'
  })
}