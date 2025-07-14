import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// 通報を更新（管理者用）
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { id } = params
    const { status, adminNotes } = await request.json()

    // TODO: 管理者権限のチェックを実装
    // const { data: { user } } = await supabase.auth.getUser()
    // if (!user || !isAdmin(user)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // ステータスの検証
    const validStatuses = ['pending', 'reviewing', 'resolved', 'dismissed']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: '無効なステータスです' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (status) {
      updateData.status = status
      if (status === 'resolved' || status === 'dismissed') {
        updateData.resolved_at = new Date().toISOString()
        // TODO: resolved_by を現在のユーザーIDに設定
        // updateData.resolved_by = user.id
      }
    }
    if (adminNotes !== undefined) {
      updateData.admin_notes = adminNotes
    }

    const { data, error } = await supabase
      .from('reports')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('通報更新エラー:', error)
      return NextResponse.json(
        { error: '通報の更新に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      report: data
    })

  } catch (error) {
    console.error('通報更新エラー:', error)
    return NextResponse.json(
      { error: '通報更新中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

// 通報の詳細取得（管理者用）
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { id } = params

    // TODO: 管理者権限のチェックを実装
    // const { data: { user } } = await supabase.auth.getUser()
    // if (!user || !isAdmin(user)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('通報取得エラー:', error)
      return NextResponse.json(
        { error: '通報の取得に失敗しました' },
        { status: 500 }
      )
    }

    // 通報対象のコンテンツも取得
    let content = null
    if (data.content_type === 'board_post') {
      const { data: postData } = await supabase
        .from('board_posts')
        .select('*, category:board_categories(*), images:board_post_images(*)')
        .eq('id', data.content_id)
        .single()
      content = postData
    } else if (data.content_type === 'board_reply') {
      const { data: replyData } = await supabase
        .from('board_replies')
        .select('*')
        .eq('id', data.content_id)
        .single()
      content = replyData
    } else if (data.content_type === 'voice_post') {
      const { data: voiceData } = await supabase
        .from('anonymous_voice_posts')
        .select('*')
        .eq('id', data.content_id)
        .single()
      content = voiceData
    }

    return NextResponse.json({
      report: data,
      content
    })

  } catch (error) {
    console.error('通報詳細取得エラー:', error)
    return NextResponse.json(
      { error: '通報詳細の取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}