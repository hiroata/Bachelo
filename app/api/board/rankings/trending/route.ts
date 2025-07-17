import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';


export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient();
    
    // 過去7日以内に作成された投稿を取得（データがない場合は全期間）
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: posts, error } = await supabase
      .from('board_posts')
      .select(`
        *,
        category:board_categories(name, slug),
        replies:board_replies(count)
      `)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('view_count', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching trending posts:', error);
      return NextResponse.json({ error: 'Failed to fetch trending posts' }, { status: 500 });
    }

    // トレンドスコアを計算（投稿からの経過時間に対するビュー数の比率）
    const postsWithTrendScore = posts?.map(post => {
      const hoursAgo = (new Date().getTime() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
      const viewsPerHour = post.view_count / Math.max(hoursAgo, 0.1);
      const trendScore = Math.round((viewsPerHour / 1000) * 100); // 1時間あたり1000ビューを100%とする
      
      return {
        ...post,
        trend_score: trendScore,
        replies: post.replies || []
      };
    }).sort((a, b) => b.trend_score - a.trend_score) || [];

    return NextResponse.json({ posts: postsWithTrendScore });
  } catch (error) {
    console.error('Error in trending rankings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}