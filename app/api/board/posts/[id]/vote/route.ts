import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { createRouteHandlerClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { vote_type } = body;
    
    if (!vote_type || !['plus', 'minus'].includes(vote_type)) {
      return NextResponse.json(
        { error: 'Invalid vote type' },
        { status: 400 }
      );
    }
    
    const ip_address = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    
    const supabase = createRouteHandlerClient();
    
    // 既存の投票を確認
    const { data: existingVote } = await supabase
      .from('board_post_votes')
      .select('*')
      .eq('post_id', params.id)
      .eq('ip_address', ip_address)
      .single();
    
    if (existingVote) {
      // 同じ投票タイプの場合は削除（取り消し）
      if (existingVote.vote_type === vote_type) {
        await supabase
          .from('board_post_votes')
          .delete()
          .eq('id', existingVote.id);
      } else {
        // 違う投票タイプの場合は更新
        await supabase
          .from('board_post_votes')
          .update({ vote_type })
          .eq('id', existingVote.id);
      }
    } else {
      // 新規投票
      await supabase
        .from('board_post_votes')
        .insert({
          post_id: params.id,
          ip_address,
          vote_type
        });
    }
    
    // 投票数を再計算
    const { count: plusCount } = await supabase
      .from('board_post_votes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', params.id)
      .eq('vote_type', 'plus');
    
    const { count: minusCount } = await supabase
      .from('board_post_votes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', params.id)
      .eq('vote_type', 'minus');
    
    // 投稿の投票数を更新
    await supabase
      .from('board_posts')
      .update({
        plus_count: plusCount || 0,
        minus_count: minusCount || 0
      })
      .eq('id', params.id);
    
    return NextResponse.json({
      plus_count: plusCount || 0,
      minus_count: minusCount || 0
    });
  } catch (error) {
    console.error('Error voting:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}