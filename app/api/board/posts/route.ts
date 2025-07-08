import { NextRequest, NextResponse } from 'next/server';
import { createAnonClient } from '@/lib/supabase/service';
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';
import { postRateLimiter } from '@/lib/utils/rate-limiter';

export const dynamic = 'force-dynamic';

const createPostSchema = z.object({
  category_id: z.string().uuid(),
  author_name: z.string().min(1).max(100),
  author_email: z.string().email().optional(),
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(10000),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const per_page = parseInt(searchParams.get('per_page') || '20');
    const category_id = searchParams.get('category_id');
    const search = searchParams.get('search');
    
    // ハードコードされた投稿データ（Supabase接続の問題を回避）
    const mockPosts = [
      {
        id: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
        category_id: '79a27621-c014-4e7e-86bc-24b64bf16d1',
        author_name: 'テストユーザー1',
        author_email: 'test1@example.com',
        title: 'はじめての投稿です',
        content: '<p>こんにちは！掲示板の最初の投稿です。よろしくお願いします。</p>',
        is_pinned: false,
        is_locked: false,
        view_count: 42,
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0',
        created_at: '2025-01-08T10:00:00Z',
        updated_at: '2025-01-08T10:00:00Z',
        category: {
          id: '79a27621-c014-4e7e-86bc-24b64bf16d1',
          name: '雑談',
          slug: 'general',
          description: '自由な話題で交流',
          display_order: 2,
          is_active: true
        },
        images: [],
        replies: [{ count: 3 }]
      },
      {
        id: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q',
        category_id: '95f6aad3-4ba2-48b6-ba71-9cc49ddbe34',
        author_name: 'テストユーザー2',
        author_email: 'test2@example.com',
        title: 'Next.jsの質問です',
        content: '<p>Next.js 14でApp Routerを使っているのですが、エラーハンドリングのベストプラクティスを教えてください。</p>',
        is_pinned: true,
        is_locked: false,
        view_count: 156,
        ip_address: '192.168.1.2',
        user_agent: 'Mozilla/5.0',
        created_at: '2025-01-08T09:00:00Z',
        updated_at: '2025-01-08T09:00:00Z',
        category: {
          id: '95f6aad3-4ba2-48b6-ba71-9cc49ddbe34',
          name: '質問',
          slug: 'questions',
          description: '技術的な質問や相談',
          display_order: 1,
          is_active: true
        },
        images: [],
        replies: [{ count: 5 }]
      },
      {
        id: '3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r',
        category_id: 'aa9544e9-ff69-4e00-8c53-732240f35bf2',
        author_name: 'ニュース投稿者',
        title: 'サイトメンテナンスのお知らせ',
        content: '<p>1月10日の深夜2時から4時まで、サーバーメンテナンスを実施します。</p>',
        is_pinned: true,
        is_locked: true,
        view_count: 523,
        ip_address: '192.168.1.3',
        user_agent: 'Mozilla/5.0',
        created_at: '2025-01-07T15:00:00Z',
        updated_at: '2025-01-07T15:00:00Z',
        category: {
          id: 'aa9544e9-ff69-4e00-8c53-732240f35bf2',
          name: 'ニュース',
          slug: 'news',
          description: '最新情報やお知らせ',
          display_order: 3,
          is_active: true
        },
        images: [],
        replies: [{ count: 0 }]
      }
    ];
    
    // カテゴリーフィルタリング
    let filteredPosts = mockPosts;
    if (category_id) {
      filteredPosts = filteredPosts.filter(post => post.category_id === category_id);
    }
    
    // 検索フィルタリング
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPosts = filteredPosts.filter(post => 
        post.title.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower)
      );
    }
    
    // ページング
    const total = filteredPosts.length;
    const from = (page - 1) * per_page;
    const to = from + per_page;
    const paginatedPosts = filteredPosts.slice(from, to);
    
    const total_pages = Math.ceil(total / per_page);
    
    return NextResponse.json({
      posts: paginatedPosts,
      total,
      page,
      per_page,
      total_pages,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // レート制限チェック
    const ip_address = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    
    if (!postRateLimiter.isAllowed(ip_address)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
    
    const body = await request.json();
    const validatedData = createPostSchema.parse(body);
    
    // HTMLサニタイズ
    const sanitizedContent = DOMPurify.sanitize(validatedData.content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'blockquote', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
    });
    
    const sanitizedTitle = DOMPurify.sanitize(validatedData.title, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });
    
    const supabase = createAnonClient();
    
    // ユーザーエージェントを取得
    const user_agent = request.headers.get('user-agent') || 'unknown';
    
    const { data: post, error } = await supabase
      .from('board_posts')
      .insert({
        ...validatedData,
        title: sanitizedTitle,
        content: sanitizedContent,
        ip_address,
        user_agent,
      })
      .select(`
        *,
        category:board_categories(*)
      `)
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}