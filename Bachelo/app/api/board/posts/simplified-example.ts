/**
 * ヘルパー関数を使った簡略化されたAPIルートの例
 * 元のroute.tsと比較して、SQLを一切書かずに実装できています
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';
import { postRateLimiter } from '@/lib/utils/rate-limiter';
import * as db from '@/lib/supabase/helpers';

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
    const perPage = parseInt(searchParams.get('per_page') || '20');
    const categoryId = searchParams.get('category_id');

    // ヘルパー関数を使って簡単に取得
    const result = await db.getPaginated('board_posts', {
      page,
      perPage,
      orderBy: 'created_at',
      ascending: false,
      filters: categoryId ? { category_id: categoryId } : {}
    });

    return NextResponse.json({
      posts: result.data,
      total: result.totalCount,
      page: result.currentPage,
      per_page: result.perPage,
      total_pages: result.totalPages
    });
    
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // レート制限チェック
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { success } = await postRateLimiter.check(ip);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validatedData = createPostSchema.parse(body);

    // XSS対策
    const sanitizedContent = DOMPurify.sanitize(validatedData.content);
    const sanitizedTitle = DOMPurify.sanitize(validatedData.title);

    // ヘルパー関数を使って簡単に作成
    const newPost = await db.create('board_posts', {
      ...validatedData,
      title: sanitizedTitle,
      content: sanitizedContent,
      ip_address: ip,
      user_agent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json(newPost, { status: 201 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}

// 使用例：特定のカテゴリーの人気投稿を取得
export async function getPopularPostsInCategory(categoryId: string) {
  // プリセットクエリを使って取得
  const allPopular = await db.queries.getPopularPosts(20);
  
  // カテゴリーでフィルタリング
  const filtered = allPopular.data.filter(post => 
    post.category_id === categoryId
  );
  
  return filtered.slice(0, 10);
}

// 使用例：投稿に返信を追加
export async function addReplyToPost(postId: string, replyData: any) {
  // トランザクション風の処理
  return await db.withTransaction(async (supabase) => {
    // 1. 返信を作成
    const reply = await db.create('board_replies', {
      post_id: postId,
      ...replyData
    });
    
    // 2. 返信数を更新
    await db.updateReplyCount(postId);
    
    return reply;
  });
}