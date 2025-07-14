import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient();
    
    // 閲覧数を増やす（まず現在の値を取得）
    const { data: currentPost } = await supabase
      .from('board_posts')
      .select('view_count')
      .eq('id', params.id)
      .single();
    
    if (currentPost) {
      await supabase
        .from('board_posts')
        .update({ view_count: (currentPost.view_count || 0) + 1 })
        .eq('id', params.id);
    }
    
    // 投稿データを取得
    const { data: post, error } = await supabase
      .from('board_posts')
      .select(`
        *,
        category:board_categories(*),
        images:board_post_images(*),
        replies:board_replies(*)
      `)
      .eq('id', params.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}