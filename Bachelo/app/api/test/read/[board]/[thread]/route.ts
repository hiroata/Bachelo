import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { parseAnchors } from '@/types/5ch';

export const dynamic = 'force-dynamic';

// GET - スレッド詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: { board: string; thread: string } }
) {
  try {
    const supabase = createRouteHandlerClient();
    const threadNumber = parseInt(params.thread);

    // 板を取得
    const { data: board, error: boardError } = await supabase
      .from('boards')
      .select('*')
      .eq('slug', params.board)
      .single();

    if (boardError || !board) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    // スレッドを取得
    const { data: thread, error: threadError } = await supabase
      .from('threads')
      .select('*')
      .eq('board_id', board.id)
      .eq('thread_number', threadNumber)
      .single();

    if (threadError || !thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    // dat落ちチェック
    if (thread.is_archived) {
      return NextResponse.json(
        { error: 'このスレッドは過去ログ倉庫に格納されています' },
        { status: 410 }
      );
    }

    // レスを取得
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select(`
        *,
        images:post_images(*)
      `)
      .eq('thread_id', thread.id)
      .order('post_number', { ascending: true });

    if (postsError) {
      console.error('Error fetching posts:', postsError);
      return NextResponse.json(
        { error: 'Failed to fetch posts' },
        { status: 500 }
      );
    }

    // アンカー情報を追加
    const postsWithAnchors = (posts || []).map(post => ({
      ...post,
      anchors: parseAnchors(post.content)
    }));

    return NextResponse.json({
      board,
      thread,
      posts: postsWithAnchors
    });
  } catch (error) {
    console.error('Error in thread detail API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - レス投稿
export async function POST(
  request: NextRequest,
  { params }: { params: { board: string; thread: string } }
) {
  try {
    const supabase = createRouteHandlerClient();
    const body = await request.json();
    const threadNumber = parseInt(params.thread);
    
    const { author_name, author_email, content } = body;

    // 板を取得
    const { data: board, error: boardError } = await supabase
      .from('boards')
      .select('*')
      .eq('slug', params.board)
      .single();

    if (boardError || !board) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    // スレッドを取得
    const { data: thread, error: threadError } = await supabase
      .from('threads')
      .select('*')
      .eq('board_id', board.id)
      .eq('thread_number', threadNumber)
      .single();

    if (threadError || !thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    // スレッドの状態チェック
    if (thread.is_archived) {
      return NextResponse.json(
        { error: 'このスレッドは過去ログ倉庫に格納されています' },
        { status: 410 }
      );
    }

    if (thread.is_locked) {
      return NextResponse.json(
        { error: 'このスレッドは書き込みできません' },
        { status: 403 }
      );
    }

    // 1000レスチェック
    if (thread.post_count >= 1000) {
      return NextResponse.json(
        { error: 'このスレッドは1000を超えました。次スレを立ててください。' },
        { status: 403 }
      );
    }

    // IPアドレスを取得
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    const ipHash = await hashIP(ip);

    // レス番号を取得
    const { data: postNumberResult } = await supabase
      .rpc('get_next_post_number', { thread_uuid: thread.id });

    const post_number = postNumberResult || 2;

    // レスを作成
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        thread_id: thread.id,
        post_number,
        author_name: author_name || board.default_name,
        author_email,
        content,
        ip_hash: ipHash,
        author_id: generatePostId(ipHash),
        user_agent: request.headers.get('user-agent') || 'unknown'
      })
      .select(`
        *,
        images:post_images(*)
      `)
      .single();

    if (postError) {
      console.error('Error creating post:', postError);
      return NextResponse.json(
        { error: 'Failed to create post' },
        { status: 500 }
      );
    }

    // アンカーを保存
    const anchors = parseAnchors(content);
    if (anchors.length > 0) {
      const anchorInserts = anchors.map(anchor => ({
        from_post_id: post.id,
        thread_id: thread.id,
        to_post_number: anchor
      }));

      await supabase
        .from('post_anchors')
        .insert(anchorInserts);
    }

    // 1000レスに達したらスレッドをロック
    if (post_number >= 1000) {
      await supabase
        .from('threads')
        .update({ is_locked: true })
        .eq('id', thread.id);
    }

    return NextResponse.json({
      post,
      thread_url: `/test/read/${board.slug}/${threadNumber}`
    });
  } catch (error) {
    console.error('Error in post API:', error);
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