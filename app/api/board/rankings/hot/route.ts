import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';


export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient();
    
    // 24時間以内に作成された投稿で、ビュー数が多い順に取得
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    const { data: posts, error } = await supabase
      .from('board_posts')
      .select(`
        *,
        category:board_categories(name, slug),
        replies:board_replies(count)
      `)
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .order('view_count', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching hot posts:', error);
      return NextResponse.json({ error: 'Failed to fetch hot posts' }, { status: 500 });
    }

    // 返信数を計算
    const postsWithReplyCount = posts?.map(post => ({
      ...post,
      replies: post.replies || []
    })) || [];

    return NextResponse.json({ posts: postsWithReplyCount });
  } catch (error) {
    console.error('Error in hot rankings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}