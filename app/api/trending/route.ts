import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// トレンド投稿取得
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    
    const timeframe = searchParams.get('timeframe') || '24h'; // 24h, 7d, 30d
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');

    // 時間範囲の設定
    const intervals = {
      '1h': '1 hour',
      '24h': '24 hours', 
      '7d': '7 days',
      '30d': '30 days'
    };

    const interval = intervals[timeframe as keyof typeof intervals] || '24 hours';

    // トレンド投稿クエリ構築
    let query = supabase
      .from('trending_posts_view')
      .select(`
        *,
        board_categories!inner(name, icon),
        post_tags(tag)
      `)
      .gte('created_at', `now() - interval '${interval}'`)
      .order('trend_score', { ascending: false })
      .limit(limit);

    // カテゴリフィルタ
    if (category) {
      query = query.eq('board_categories.name', category);
    }

    const { data: posts, error } = await query;

    if (error) throw error;

    // トレンドトピック取得
    const { data: topics, error: topicsError } = await supabase
      .from('trending_topics')
      .select('*')
      .gte('trending_start', `now() - interval '${interval}'`)
      .order('engagement_score', { ascending: false })
      .limit(10);

    if (topicsError) throw topicsError;

    return NextResponse.json({
      posts: posts || [],
      topics: topics || [],
      timeframe,
      total: posts?.length || 0
    });

  } catch (error) {
    console.error('Trending API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// トレンドデータ更新（バックグラウンド処理用）
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // トレンドトピック分析
    await analyzeTrendingTopics(supabase);
    
    // ユーザーレピュテーション再計算
    await recalculateUserReputations(supabase);
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Trending update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// トレンドトピック分析
async function analyzeTrendingTopics(supabase: any) {
  try {
    // 過去24時間の投稿からキーワード抽出
    const { data: posts } = await supabase
      .from('board_posts')
      .select('id, title, content, category_id, created_at, reply_count, view_count, plus_count')
      .gte('created_at', 'now() - interval \'24 hours\'');

    if (!posts) return;

    // 簡単なキーワード抽出（実際はより高度な自然言語処理を使用）
    const keywordCounts = new Map<string, any>();
    
    posts.forEach(post => {
      const text = `${post.title} ${post.content}`.toLowerCase();
      const words = text.match(/[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\w]+/g) || [];
      
      words.forEach(word => {
        if (word.length >= 2 && word.length <= 10) {
          if (!keywordCounts.has(word)) {
            keywordCounts.set(word, {
              keyword: word,
              mention_count: 0,
              engagement_score: 0,
              related_posts: [],
              category_id: post.category_id
            });
          }
          
          const data = keywordCounts.get(word);
          data.mention_count++;
          data.engagement_score += (post.reply_count * 2 + post.view_count * 0.1 + post.plus_count);
          data.related_posts.push(post.id);
        }
      });
    });

    // トレンドトピックをデータベースに保存
    for (const [keyword, data] of keywordCounts) {
      if (data.mention_count >= 3) { // 3回以上言及されたもののみ
        await supabase
          .from('trending_topics')
          .upsert({
            keyword: data.keyword,
            category_id: data.category_id,
            mention_count: data.mention_count,
            engagement_score: data.engagement_score,
            velocity_score: data.engagement_score / Math.max(1, Date.now() - new Date(posts[0].created_at).getTime()),
            related_posts: data.related_posts.slice(0, 10),
            trending_start: new Date().toISOString()
          }, {
            onConflict: 'keyword',
            ignoreDuplicates: false
          });
      }
    }
  } catch (error) {
    console.error('Failed to analyze trending topics:', error);
  }
}

// ユーザーレピュテーション再計算
async function recalculateUserReputations(supabase: any) {
  try {
    // 全ユーザーのレピュテーション再計算
    const { data: users } = await supabase
      .from('user_reputation')
      .select('user_id');

    if (!users) return;

    for (const user of users) {
      // 投稿ポイント計算
      const { data: posts } = await supabase
        .from('board_posts')
        .select('plus_count, minus_count')
        .eq('ip_hash', user.user_id);

      // 返信ポイント計算  
      const { data: replies } = await supabase
        .from('board_replies')
        .select('plus_count, minus_count')
        .eq('ip_hash', user.user_id);

      // リアクション受信ポイント
      const { data: reactions } = await supabase
        .from('post_reactions')
        .select('reaction_type')
        .in('post_id', posts?.map(p => p.id) || []);

      const postPoints = posts?.reduce((sum, p) => sum + (p.plus_count * 2 - p.minus_count), 0) || 0;
      const replyPoints = replies?.reduce((sum, r) => sum + (r.plus_count - r.minus_count), 0) || 0;
      const reactionPoints = reactions?.length || 0;
      
      const totalPoints = postPoints + replyPoints + reactionPoints;
      const level = Math.floor(totalPoints / 100) + 1; // 100ポイントで1レベルアップ

      // レピュテーション更新
      await supabase
        .from('user_reputation')
        .update({
          post_points: postPoints,
          reply_points: replyPoints, 
          reaction_received_points: reactionPoints,
          experience_points: totalPoints,
          current_level: level,
          reputation_score: Math.floor(totalPoints * 1.2), // ボーナス
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.user_id);
    }
  } catch (error) {
    console.error('Failed to recalculate reputations:', error);
  }
}