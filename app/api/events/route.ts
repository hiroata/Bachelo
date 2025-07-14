import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

// イベント作成スキーマ
const eventCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  eventType: z.enum(['contest', 'challenge', 'ama', 'collaboration', 'theme_week', 'voting', 'celebration']),
  startDate: z.string(),
  endDate: z.string(),
  votingEndDate: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  maxParticipants: z.number().int().positive().optional(),
  prizeDescription: z.string().optional(),
  rules: z.string().optional(),
  featuredImageUrl: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
  organizerId: z.string()
});

// イベント参加スキーマ
const participationSchema = z.object({
  eventId: z.string().uuid(),
  userId: z.string(),
  displayName: z.string().min(1).max(100),
  submissionPostId: z.string().uuid().optional()
});

// イベント一覧取得
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get('status'); // 'active', 'planned', 'ended'
    const eventType = searchParams.get('type');
    const categoryId = searchParams.get('categoryId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    let query = supabase
      .from('board_events')
      .select(`
        *,
        board_categories(name, icon),
        event_participants(id, user_id, display_name, score, rank)
      `)
      .order('start_date', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    // フィルタ適用
    if (status) {
      query = query.eq('status', status);
    }
    if (eventType) {
      query = query.eq('event_type', eventType);
    }
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data: events, error, count } = await query;
    if (error) throw error;

    // 現在アクティブなイベントのステータス更新
    await updateEventStatuses(supabase);

    return NextResponse.json({
      events: events || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Events GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// イベント作成
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();
    
    const eventData = eventCreateSchema.parse(body);

    // 日付検証
    const startDate = new Date(eventData.startDate);
    const endDate = new Date(eventData.endDate);
    
    if (endDate <= startDate) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
    }

    // イベント作成
    const { data: event, error } = await supabase
      .from('board_events')
      .insert({
        title: eventData.title,
        description: eventData.description,
        event_type: eventData.eventType,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        voting_end_date: eventData.votingEndDate ? new Date(eventData.votingEndDate).toISOString() : null,
        category_id: eventData.categoryId,
        max_participants: eventData.maxParticipants,
        prize_description: eventData.prizeDescription,
        rules: eventData.rules,
        featured_image_url: eventData.featuredImageUrl,
        tags: eventData.tags,
        organizer_id: eventData.organizerId,
        status: startDate <= new Date() ? 'active' : 'planned'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, event });

  } catch (error) {
    console.error('Event creation error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// イベント参加
export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();
    
    const { eventId, userId, displayName, submissionPostId } = participationSchema.parse(body);

    // イベント存在確認
    const { data: event, error: eventError } = await supabase
      .from('board_events')
      .select('*')
      .eq('id', eventId)
      .eq('status', 'active')
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found or not active' }, { status: 404 });
    }

    // 参加者数制限チェック
    if (event.max_participants && event.participant_count >= event.max_participants) {
      return NextResponse.json({ error: 'Event is full' }, { status: 409 });
    }

    // 参加登録
    const { data: participation, error } = await supabase
      .from('event_participants')
      .upsert({
        event_id: eventId,
        user_id: userId,
        display_name: displayName,
        submission_post_id: submissionPostId,
        joined_at: submissionPostId ? undefined : new Date().toISOString(),
        submitted_at: submissionPostId ? new Date().toISOString() : undefined
      }, {
        onConflict: 'event_id,user_id'
      })
      .select()
      .single();

    if (error) throw error;

    // イベント参加者数更新
    await supabase
      .from('board_events')
      .update({
        participant_count: event.participant_count + (submissionPostId ? 0 : 1)
      })
      .eq('id', eventId);

    // 通知作成
    await createNotification(supabase, {
      userId: event.organizer_id,
      type: 'event',
      title: 'New Event Participant',
      message: `${displayName} joined your event: ${event.title}`,
      relatedPostId: eventId
    });

    return NextResponse.json({ success: true, participation });

  } catch (error) {
    console.error('Event participation error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ヘルパー関数: イベントステータス更新
async function updateEventStatuses(supabase: any) {
  try {
    const now = new Date().toISOString();

    // 開始時刻になったイベントをアクティブに
    await supabase
      .from('board_events')
      .update({ status: 'active' })
      .eq('status', 'planned')
      .lte('start_date', now);

    // 終了時刻になったイベントを投票期間に（投票終了日がある場合）
    await supabase
      .from('board_events')
      .update({ status: 'voting' })
      .eq('status', 'active')
      .lte('end_date', now)
      .not('voting_end_date', 'is', null);

    // 完全終了したイベント
    await supabase
      .from('board_events')
      .update({ status: 'ended' })
      .eq('status', 'active')
      .lte('end_date', now)
      .is('voting_end_date', null);

    // 投票期間終了
    await supabase
      .from('board_events')
      .update({ status: 'ended' })
      .eq('status', 'voting')
      .lte('voting_end_date', now);

  } catch (error) {
    console.error('Failed to update event statuses:', error);
  }
}

// 通知作成ヘルパー
async function createNotification(supabase: any, notification: {
  userId: string;
  type: string;
  title: string;
  message: string;
  relatedPostId?: string;
}) {
  try {
    await supabase
      .from('user_notifications')
      .insert({
        user_id: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        related_post_id: notification.relatedPostId
      });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}