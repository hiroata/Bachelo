import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createHash } from 'crypto'

export const dynamic = 'force-dynamic'

// IPアドレスをハッシュ化
function hashIpAddress(ip: string): string {
  return createHash('sha256').update(ip).digest('hex')
}

// クライアントIPを取得
function getClientIp(request: NextRequest): string {
  const xForwardedFor = request.headers.get('x-forwarded-for')
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim()
  }
  
  const xRealIp = request.headers.get('x-real-ip')
  if (xRealIp) {
    return xRealIp
  }
  
  return '127.0.0.1'
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { contentType, contentId, reason, description } = await request.json()

    // 入力検証
    if (!contentType || !contentId || !reason) {
      return NextResponse.json(
        { error: '必須項目が入力されていません' },
        { status: 400 }
      )
    }

    // コンテンツタイプの検証
    const validContentTypes = ['voice_post', 'board_post', 'board_reply']
    if (!validContentTypes.includes(contentType)) {
      return NextResponse.json(
        { error: '無効なコンテンツタイプです' },
        { status: 400 }
      )
    }

    // 通報理由の検証
    const validReasons = [
      'illegal_content',
      'child_abuse',
      'harassment',
      'spam',
      'copyright',
      'personal_info',
      'violence',
      'other'
    ]
    if (!validReasons.includes(reason)) {
      return NextResponse.json(
        { error: '無効な通報理由です' },
        { status: 400 }
      )
    }

    // IPアドレスの取得とハッシュ化
    const clientIp = getClientIp(request)
    const ipHash = hashIpAddress(clientIp)

    // 既存の通報をチェック（同一IPから同じコンテンツへの重複通報を防ぐ）
    const { data: existingReport, error: checkError } = await supabase
      .from('reports')
      .select('id')
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .eq('reporter_ip_hash', ipHash)
      .eq('status', 'pending')
      .single()

    if (existingReport) {
      return NextResponse.json(
        { error: 'このコンテンツは既に通報済みです' },
        { status: 400 }
      )
    }

    // 通報を作成
    const { data, error } = await supabase
      .from('reports')
      .insert({
        content_type: contentType,
        content_id: contentId,
        reason,
        description: description || null,
        reporter_ip_hash: ipHash,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('通報作成エラー:', error)
      return NextResponse.json(
        { error: '通報の送信に失敗しました' },
        { status: 500 }
      )
    }

    // 通報数が多いコンテンツの場合、自動的に非表示にする処理を追加可能
    // （例：3件以上の通報があった場合）
    const { count } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .in('status', ['pending', 'reviewing'])

    if (count && count >= 3) {
      // 自動モデレーション処理をここに実装
      // 例：コンテンツを一時的に非表示にする
      console.log(`警告: ${contentType} ${contentId} に${count}件の通報があります`)
    }

    return NextResponse.json({
      success: true,
      message: '通報を受け付けました',
      reportId: data.id
    })

  } catch (error) {
    console.error('通報処理エラー:', error)
    return NextResponse.json(
      { error: '通報処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

// 通報一覧取得（管理者用）
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    
    const status = searchParams.get('status') || 'pending'
    const contentType = searchParams.get('content_type')
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('per_page') || '20')
    
    // TODO: 管理者権限のチェックを実装
    // const { data: { user } } = await supabase.auth.getUser()
    // if (!user || !isAdmin(user)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    let query = supabase
      .from('reports')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1)

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (contentType) {
      query = query.eq('content_type', contentType)
    }

    const { data, error, count } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      reports: data,
      total: count,
      totalPages: Math.ceil((count || 0) / perPage),
      currentPage: page
    })

  } catch (error) {
    console.error('通報一覧取得エラー:', error)
    return NextResponse.json(
      { error: '通報一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}