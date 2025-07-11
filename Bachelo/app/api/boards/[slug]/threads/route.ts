import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { calculateThreadSpeed } from '@/types/5ch';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createRouteHandlerClient();
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const per_page = parseInt(searchParams.get('per_page') || '50');
    const sort = searchParams.get('sort') || 'speed'; // speed | latest | created

    // 板を取得
    const { data: board, error: boardError } = await supabase
      .from('boards')
      .select('*')
      .eq('slug', params.slug)
      .single();

    if (boardError || !board) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    // スレッド一覧を取得
    let query = supabase
      .from('threads')
      .select('*', { count: 'exact' })
      .eq('board_id', board.id)
      .eq('is_archived', false);

    // ソート条件
    if (sort === 'latest') {
      query = query.order('last_post_at', { ascending: false });
    } else if (sort === 'created') {
      query = query.order('created_at', { ascending: false });
    } else {
      // デフォルトは最新順（勢いはクライアント側で計算）
      query = query.order('last_post_at', { ascending: false });
    }

    const from = (page - 1) * per_page;
    const to = from + per_page - 1;
    
    const { data: threads, error: threadsError, count } = await query.range(from, to);

    if (threadsError) {
      console.error('Error fetching threads:', threadsError);
      return NextResponse.json(
        { error: 'Failed to fetch threads' },
        { status: 500 }
      );
    }

    // 各スレッドの最初のレスを取得
    const threadsWithFirstPost = await Promise.all(
      (threads || []).map(async (thread) => {
        const { data: firstPost } = await supabase
          .from('posts')
          .select('author_name, content')
          .eq('thread_id', thread.id)
          .eq('post_number', 1)
          .single();

        // 勢いを計算
        const speed = calculateThreadSpeed(thread);

        return {
          ...thread,
          first_post: firstPost,
          speed
        };
      })
    );

    // 勢い順の場合はソート
    if (sort === 'speed') {
      threadsWithFirstPost.sort((a, b) => b.speed - a.speed);
    }

    const total_pages = Math.ceil((count || 0) / per_page);

    return NextResponse.json({
      board,
      threads: threadsWithFirstPost,
      page,
      per_page,
      total: count || 0,
      total_pages
    });
  } catch (error) {
    console.error('Error in threads API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - 新規スレッド作成
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createRouteHandlerClient();
    const body = await request.json();
    
    const { title, author_name, author_email, content, images } = body;

    // 板を取得
    const { data: board, error: boardError } = await supabase
      .from('boards')
      .select('*')
      .eq('slug', params.slug)
      .single();

    if (boardError || !board) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    // スレッド番号を取得
    const { data: threadNumberResult } = await supabase
      .rpc('get_next_thread_number', { board_uuid: board.id });

    const thread_number = threadNumberResult || 1;

    // IPアドレスを取得
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    const ipHash = await hashIP(ip);

    // スレッドを作成
    const { data: thread, error: threadError } = await supabase
      .from('threads')
      .insert({
        board_id: board.id,
        thread_number,
        title: title.slice(0, 200)
      })
      .select()
      .single();

    if (threadError) {
      console.error('Error creating thread:', threadError);
      return NextResponse.json(
        { error: 'Failed to create thread' },
        { status: 500 }
      );
    }

    // 最初のレスを作成
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        thread_id: thread.id,
        post_number: 1,
        author_name: author_name || board.default_name,
        author_email,
        content,
        ip_hash: ipHash,
        author_id: generatePostId(ipHash),
        user_agent: request.headers.get('user-agent') || 'unknown'
      })
      .select()
      .single();

    if (postError) {
      console.error('Error creating first post:', postError);
      // スレッドも削除
      await supabase.from('threads').delete().eq('id', thread.id);
      return NextResponse.json(
        { error: 'Failed to create post' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      thread,
      post,
      url: `/test/read/${board.slug}/${thread_number}`
    });
  } catch (error) {
    console.error('Error in create thread API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// IPアドレスのハッシュ化
async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + process.env.IP_SALT || 'default-salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ID生成
function generatePostId(ipHash: string): string {
  const now = new Date();
  const dateStr = `${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
  return ipHash.slice(0, 8);
}