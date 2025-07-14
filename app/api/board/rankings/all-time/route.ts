import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';


export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get('range') || 'all';
    
    let query = supabase
      .from('board_posts')
      .select(`
        *,
        category:board_categories(name, slug),
        replies:board_replies(count)
      `);

    // 期間でフィルタリング
    if (range !== 'all') {
      const now = new Date();
      const startDate = new Date();
      
      switch (range) {
        case '24h':
          startDate.setHours(now.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
      }
      
      query = query.gte('created_at', startDate.toISOString());
    }
    
    // ビュー数と評価を組み合わせたスコアで並び替え
    const { data: posts, error } = await query
      .order('view_count', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching all-time posts:', error);
      return NextResponse.json({ error: 'Failed to fetch all-time posts' }, { status: 500 });
    }

    // スコアを計算して並び替え
    const rankedPosts = posts?.map(post => {
      // スコア = ビュー数 + (プラス評価 * 100) - (マイナス評価 * 50)
      const score = post.view_count + (post.plus_count * 100) - (post.minus_count * 50);
      return {
        ...post,
        score,
        replies: post.replies || []
      };
    }).sort((a, b) => b.score - a.score).slice(0, 30) || [];

    return NextResponse.json({ posts: rankedPosts });
  } catch (error) {
    console.error('Error in all-time rankings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}