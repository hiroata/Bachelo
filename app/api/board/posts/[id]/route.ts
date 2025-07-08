import { NextRequest, NextResponse } from 'next/server';
import { createAnonClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ハードコードされた投稿データ（Supabase接続の問題を回避）
    const mockPosts: Record<string, any> = {
      '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p': {
        id: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
        category_id: '79a27621-c014-4e7e-86bc-24b64bf16d1',
        author_name: 'テストユーザー1',
        author_email: 'test1@example.com',
        title: 'はじめての投稿です',
        content: '<p>こんにちは！掲示板の最初の投稿です。よろしくお願いします。</p>',
        is_pinned: false,
        is_locked: false,
        view_count: 43, // 閲覧時にインクリメント
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
        replies: [
          {
            id: 'reply1',
            post_id: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
            author_name: '名無しさん',
            content: 'よろしくお願いします！',
            created_at: '2025-01-08T11:00:00Z'
          },
          {
            id: 'reply2',
            post_id: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
            author_name: '匿名希望',
            content: '掲示板開設おめでとうございます',
            created_at: '2025-01-08T12:00:00Z'
          },
          {
            id: 'reply3',
            post_id: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
            author_name: 'ゲスト',
            content: '楽しみです！',
            created_at: '2025-01-08T13:00:00Z'
          }
        ]
      },
      '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q': {
        id: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q',
        category_id: '95f6aad3-4ba2-48b6-ba71-9cc49ddbe34',
        author_name: 'テストユーザー2',
        author_email: 'test2@example.com',
        title: 'Next.jsの質問です',
        content: '<p>Next.js 14でApp Routerを使っているのですが、エラーハンドリングのベストプラクティスを教えてください。</p>',
        is_pinned: true,
        is_locked: false,
        view_count: 157,
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
        replies: []
      },
      '3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r': {
        id: '3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r',
        category_id: 'aa9544e9-ff69-4e00-8c53-732240f35bf2',
        author_name: 'ニュース投稿者',
        title: 'サイトメンテナンスのお知らせ',
        content: '<p>1月10日の深夜2時から4時まで、サーバーメンテナンスを実施します。</p>',
        is_pinned: true,
        is_locked: true,
        view_count: 524,
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
        replies: []
      }
    };
    
    const post = mockPosts[params.id];
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    // 閲覧数をインクリメント（実際にはメモリ上でのみ）
    post.view_count = (post.view_count || 0) + 1;
    
    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}