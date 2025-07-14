import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

// リアクション追加/削除のスキーマ
const reactionSchema = z.object({
  postId: z.string().uuid().optional(),
  replyId: z.string().uuid().optional(), 
  reactionType: z.enum(['like', 'love', 'laugh', 'angry', 'sad', 'wow', 'cute', 'hot', 'cool', 'thinking', 'crying', 'party']),
  userId: z.string(),
  action: z.enum(['add', 'remove'])
}).refine((data) => data.postId || data.replyId, {
  message: "Either postId or replyId must be provided"
});

// リアクション追加/削除
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();
    const { postId, replyId, reactionType, userId, action } = reactionSchema.parse(body);
    
    // IPアドレスのハッシュ化
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    const ipHash = await hashIP(ip);

    if (action === 'add') {
      // リアクション追加
      const tableName = postId ? 'post_reactions' : 'reply_reactions';
      const targetField = postId ? 'post_id' : 'reply_id';
      const targetValue = postId || replyId;

      const { data, error } = await supabase
        .from(tableName)
        .insert({
          [targetField]: targetValue,
          reaction_type: reactionType,
          user_id: userId,
          ip_hash: ipHash
        })
        .select();

      if (error) {
        if (error.code === '23505') { // 重複エラー
          return NextResponse.json({ error: 'Already reacted' }, { status: 409 });
        }
        throw error;
      }

      // ユーザーレピュテーション更新（リアクションを受けた人）
      if (postId) {
        await updateUserReputation(supabase, postId, 'post', 'reaction_received');
      }

      return NextResponse.json({ success: true, data });
    } else {
      // リアクション削除
      const tableName = postId ? 'post_reactions' : 'reply_reactions';
      const targetField = postId ? 'post_id' : 'reply_id';
      const targetValue = postId || replyId;

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq(targetField, targetValue)
        .eq('reaction_type', reactionType)
        .eq('user_id', userId);

      if (error) throw error;

      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error('Reaction API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// リアクション統計取得
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const replyId = searchParams.get('replyId');

    if (!postId && !replyId) {
      return NextResponse.json({ error: 'postId or replyId required' }, { status: 400 });
    }

    const tableName = postId ? 'post_reactions' : 'reply_reactions';
    const targetField = postId ? 'post_id' : 'reply_id';
    const targetValue = postId || replyId;

    // リアクション統計取得
    const { data: reactions, error } = await supabase
      .from(tableName)
      .select('reaction_type')
      .eq(targetField, targetValue);

    if (error) throw error;

    // リアクションタイプ別に集計
    const stats = reactions.reduce((acc: any, reaction: any) => {
      acc[reaction.reaction_type] = (acc[reaction.reaction_type] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({ reactions: stats });
  } catch (error) {
    console.error('Get reactions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ヘルパー関数
async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + process.env.IP_HASH_SALT || 'bachelo-salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function updateUserReputation(supabase: any, contentId: string, contentType: string, actionType: string) {
  try {
    // 投稿者のIDを取得
    const { data: content } = await supabase
      .from(contentType === 'post' ? 'board_posts' : 'board_replies')
      .select('ip_hash')
      .eq('id', contentId)
      .single();

    if (!content?.ip_hash) return;

    // レピュテーション更新
    await supabase.rpc('update_user_reputation', {
      p_user_id: content.ip_hash,
      p_action_type: actionType,
      p_points: actionType === 'reaction_received' ? 1 : 0
    });
  } catch (error) {
    console.error('Failed to update reputation:', error);
  }
}