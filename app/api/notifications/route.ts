import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/server';

import { z } from 'zod';

// 通知取得パラメータ
const notificationQuerySchema = z.object({
  userId: z.string(),
  limit: z.number().int().positive().default(20),
  offset: z.number().int().min(0).default(0),
  unreadOnly: z.boolean().default(false),
  type: z.enum(['reply', 'reaction', 'mention', 'follow', 'award', 'trending', 'system', 'event', 'milestone']).optional()
});

// 通知作成スキーマ
const notificationCreateSchema = z.object({
  userId: z.string(),
  type: z.enum(['reply', 'reaction', 'mention', 'follow', 'award', 'trending', 'system', 'event', 'milestone']),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  relatedPostId: z.string().uuid().optional(),
  relatedUserId: z.string().optional(),
  metadata: z.record(z.any()).default({})
});

// 通知一覧取得
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const params = notificationQuerySchema.parse({
      userId,
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
      unreadOnly: searchParams.get('unreadOnly') === 'true',
      type: searchParams.get('type') || undefined
    });

    let query = supabase
      .from('user_notifications')
      .select(`
        *,
        related_post:board_posts(id, title),
        related_user:user_profiles!related_user_id(display_name)
      `)
      .eq('user_id', params.userId)
      .order('created_at', { ascending: false })
      .range(params.offset, params.offset + params.limit - 1);

    // フィルタ適用
    if (params.unreadOnly) {
      query = query.eq('is_read', false);
    }
    if (params.type) {
      query = query.eq('type', params.type);
    }

    const { data: notifications, error, count } = await query;
    if (error) throw error;

    // 未読数取得
    const { count: unreadCount, error: unreadError } = await supabase
      .from('user_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', params.userId)
      .eq('is_read', false);

    if (unreadError) throw unreadError;

    return NextResponse.json({
      notifications: notifications || [],
      unreadCount: unreadCount || 0,
      hasMore: (notifications?.length || 0) === params.limit
    });

  } catch (error: any) {
    console.error('Notifications GET error:', error);
    
    // テーブルが存在しない場合は空の結果を返す
    if (error?.message?.includes('does not exist')) {
      return NextResponse.json({
        notifications: [],
        unreadCount: 0,
        hasMore: false
      });
    }
    
    return NextResponse.json({ 
      error: error?.message || 'Internal server error' 
    }, { status: 500 });
  }
}

// 通知作成
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    const notificationData = notificationCreateSchema.parse(body);

    // 通知作成
    const { data: notification, error } = await supabase
      .from('user_notifications')
      .insert(notificationData)
      .select()
      .single();

    if (error) throw error;

    // リアルタイム通知送信（Supabase Realtime）
    await supabase
      .channel(`notifications:${notificationData.userId}`)
      .send({
        type: 'broadcast',
        event: 'new_notification',
        payload: notification
      });

    return NextResponse.json({ success: true, notification });

  } catch (error) {
    console.error('Notification creation error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 通知既読化
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const body = await request.json();
    
    const userId = searchParams.get('userId');
    const notificationId = searchParams.get('notificationId');
    const markAllRead = body.markAllRead === true;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    let query = supabase
      .from('user_notifications')
      .update({ 
        is_read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('user_id', userId);

    if (!markAllRead && notificationId) {
      query = query.eq('id', notificationId);
    }

    const { error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Notification update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 通知削除
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    
    const userId = searchParams.get('userId');
    const notificationId = searchParams.get('notificationId');

    if (!userId || !notificationId) {
      return NextResponse.json({ error: 'userId and notificationId are required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('user_notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Notification deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}