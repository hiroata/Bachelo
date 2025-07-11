import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient();
    
    // アクティブな板を取得
    const { data: boards, error } = await supabase
      .from('boards')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching boards:', error);
      return NextResponse.json(
        { error: 'Failed to fetch boards' },
        { status: 500 }
      );
    }

    // カテゴリーごとにグループ化
    const categorizedBoards = boards.reduce((acc: Record<string, typeof boards>, board) => {
      const category = board.category || 'その他';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(board);
      return acc;
    }, {});

    // カテゴリーのリストを作成
    const categories = Object.keys(categorizedBoards).sort();

    // 各板のスレッド数と最新投稿を取得
    const boardsWithStats = await Promise.all(
      boards.map(async (board) => {
        // スレッド数を取得
        const { count: threadCount } = await supabase
          .from('threads')
          .select('*', { count: 'exact', head: true })
          .eq('board_id', board.id)
          .eq('is_archived', false);

        // 最新スレッドを取得
        const { data: latestThread } = await supabase
          .from('threads')
          .select('title, last_post_at')
          .eq('board_id', board.id)
          .eq('is_archived', false)
          .order('last_post_at', { ascending: false })
          .limit(1)
          .single();

        return {
          ...board,
          thread_count: threadCount || 0,
          latest_thread: latestThread
        };
      })
    );

    return NextResponse.json({
      boards: boardsWithStats,
      categories,
      categorized: categorizedBoards
    });
  } catch (error) {
    console.error('Error in boards API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}