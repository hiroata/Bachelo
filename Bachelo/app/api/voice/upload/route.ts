import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { uploadVoiceFile, getAudioDuration, validateAudioFile } from '@/lib/storage/voice-storage'
import { hashIPAddress } from '@/lib/utils/server-utils'
import { headers } from 'next/headers'
import { Database } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const formData = await request.formData()
    
    const category = formData.get('category') as 'female' | 'male' | 'couple'
    const nickname = formData.get('nickname') as string
    const message = formData.get('message') as string
    const audioFile = formData.get('audio') as File
    
    if (!category || !nickname || !message || !audioFile) {
      return NextResponse.json(
        { error: '必須項目が不足しています' },
        { status: 400 }
      )
    }
    
    // ファイル検証
    const validation = validateAudioFile(audioFile)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }
    
    // 音声ファイルの長さを取得（クライアントサイドで実行する必要があるため、一時的に0に設定）
    const duration = 0 // TODO: クライアントサイドで取得してから送信
    
    // IPアドレスの取得とハッシュ化（スパム対策）
    const headersList = headers()
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
    const ipHash = ip !== 'unknown' ? hashIPAddress(ip) : null
    
    // Supabase Storageにアップロード
    const { url: audioUrl, filePath, fileSize, mimeType } = await uploadVoiceFile({
      file: audioFile,
      category
    })
    
    // データベースに投稿を保存
    const { data: newPost, error: dbError } = await supabase
      .from('anonymous_voice_posts')
      .insert({
        nickname,
        category,
        message,
        avatar_emoji: getRandomEmoji(category),
        avatar_color: getRandomColor(category),
        audio_url: audioUrl,
        duration_seconds: duration,
        file_size_bytes: fileSize,
        mime_type: mimeType,
        ip_hash: ipHash
      })
      .select()
      .single()
    
    if (dbError) {
      console.error('Database error:', dbError)
      // ストレージからファイルを削除
      await supabase.storage.from('voice-posts').remove([filePath])
      return NextResponse.json(
        { error: 'データベースへの保存に失敗しました' },
        { status: 500 }
      )
    }
    
    // レスポンス用にデータを整形
    const formattedPost = {
      id: newPost.id,
      username: newPost.nickname,
      avatarEmoji: newPost.avatar_emoji,
      avatarColor: newPost.avatar_color,
      message: newPost.message,
      duration: newPost.duration_seconds,
      likes: newPost.likes_count,
      comments: newPost.comments_count,
      postedAt: new Date(newPost.created_at).toISOString(),
      audioUrl: newPost.audio_url,
      isAnonymous: true
    }
    
    return NextResponse.json({
      success: true,
      post: formattedPost,
      message: '投稿が完了しました'
    })
    
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'アップロード中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

// 最近の投稿を取得
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') as 'female' | 'male' | 'couple' | null
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // クエリを構築
    let query = supabase
      .from('anonymous_voice_posts')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1)
    
    // カテゴリーフィルター
    if (category) {
      query = query.eq('category', category)
    }
    
    const { data: posts, error } = await query
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'データの取得に失敗しました' },
        { status: 500 }
      )
    }
    
    // レスポンス用にデータを整形
    const formattedPosts = posts.map((post: Database['public']['Tables']['anonymous_voice_posts']['Row']) => ({
      id: post.id,
      username: post.nickname,
      avatarEmoji: post.avatar_emoji,
      avatarColor: post.avatar_color,
      message: post.message,
      duration: post.duration_seconds,
      likes: post.likes_count,
      comments: post.comments_count,
      postedAt: formatRelativeTime(post.created_at),
      audioUrl: post.audio_url,
      isAnonymous: true
    }))
    
    return NextResponse.json({
      posts: formattedPosts,
      hasMore: posts.length === limit
    })
  } catch (error) {
    console.error('Get posts error:', error)
    return NextResponse.json(
      { error: '投稿の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// 相対時間を計算する関数
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  
  if (diffDay > 0) {
    return `${diffDay}日前`
  } else if (diffHour > 0) {
    return `${diffHour}時間前`
  } else if (diffMin > 0) {
    return `${diffMin}分前`
  } else {
    return 'たった今'
  }
}

// カテゴリーに応じたランダムな絵文字を返す
function getRandomEmoji(category: string): string {
  const emojis = {
    female: ['😊', '💕', '🎀', '💋', '🌸'],
    male: ['😎', '🎯', '💪', '🔥', '⚡'],
    couple: ['💑', '❤️', '💏', '💖', '💝']
  }
  const categoryEmojis = emojis[category as keyof typeof emojis] || emojis.female
  return categoryEmojis[Math.floor(Math.random() * categoryEmojis.length)]
}

// カテゴリーに応じたランダムな色を返す
function getRandomColor(category: string): string {
  const colors = {
    female: ['bg-pink-500', 'bg-rose-500', 'bg-pink-400'],
    male: ['bg-blue-500', 'bg-indigo-500', 'bg-blue-600'],
    couple: ['bg-purple-500', 'bg-violet-500', 'bg-fuchsia-500']
  }
  const categoryColors = colors[category as keyof typeof colors] || colors.female
  return categoryColors[Math.floor(Math.random() * categoryColors.length)]
}