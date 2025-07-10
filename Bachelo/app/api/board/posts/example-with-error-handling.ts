/**
 * 新しいエラーハンドリングを使用したAPIルートの例
 * Supabaseのエラーがわかりやすく処理されます
 */

import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/supabase/helpers';
import { 
  handleSupabaseError, 
  withSupabaseErrorHandling 
} from '@/lib/utils/supabase-error-handler';
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// 入力検証スキーマ
const createPostSchema = z.object({
  category_id: z.string().uuid('カテゴリーIDが不正です'),
  author_name: z.string().min(1, '名前を入力してください').max(100),
  title: z.string().min(1, 'タイトルを入力してください').max(200),
  content: z.string().min(1, '内容を入力してください').max(10000),
});

/**
 * 投稿一覧を取得（エラーハンドリング付き）
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const categoryId = searchParams.get('category_id');

    // ヘルパー関数でデータ取得
    const result = await db.getPaginated('board_posts', {
      page,
      filters: categoryId ? { category_id: categoryId } : {}
    });

    return NextResponse.json(result);
    
  } catch (error) {
    // Supabase専用のエラーハンドリング
    return handleSupabaseError(error);
  }
}

/**
 * 新規投稿作成（エラーハンドリング付き）
 */
export async function POST(request: NextRequest) {
  try {
    // リクエストボディを取得
    const body = await request.json();
    
    // 入力検証
    const validatedData = createPostSchema.parse(body);
    
    // XSS対策
    const sanitizedData = {
      ...validatedData,
      title: DOMPurify.sanitize(validatedData.title),
      content: DOMPurify.sanitize(validatedData.content),
    };
    
    // IPアドレス取得
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    // データベースに保存
    const newPost = await db.create('board_posts', {
      ...sanitizedData,
      ip_address: ip,
      user_agent: request.headers.get('user-agent') || undefined,
    });
    
    return NextResponse.json(newPost, { status: 201 });
    
  } catch (error) {
    // Zodのバリデーションエラー
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            type: 'VALIDATION_ERROR',
            message: '入力内容に誤りがあります',
            details: error.errors.map(e => ({
              field: e.path.join('.'),
              message: e.message
            }))
          }
        },
        { status: 400 }
      );
    }
    
    // Supabaseエラー
    return handleSupabaseError(error);
  }
}

/**
 * withSupabaseErrorHandlingを使った例
 */
export async function getPostWithReplies(postId: string) {
  // エラーハンドリングを自動化
  const post = await withSupabaseErrorHandling(
    async () => {
      // 投稿を取得
      const postData = await db.getById('board_posts', postId);
      
      // 返信を取得
      const replies = await db.getPaginated('board_replies', {
        filters: { post_id: postId },
        perPage: 100
      });
      
      return {
        ...postData,
        replies: replies.data
      };
    },
    {
      // エラー時のデフォルト値
      defaultValue: null,
      // カスタムエラーハンドリング
      onError: (error) => {
        console.error(`投稿 ${postId} の取得に失敗:`, error.message);
      }
    }
  );
  
  return post;
}

/**
 * フロントエンドでの使用例
 */
export const clientExample = `
import { getToastMessage } from '@/lib/utils/supabase-error-handler';
import toast from 'react-hot-toast';

// APIを呼び出す
async function createPost(data: PostData) {
  try {
    const response = await fetch('/api/board/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw error;
    }
    
    const newPost = await response.json();
    toast.success('投稿を作成しました！');
    return newPost;
    
  } catch (error) {
    // エラーメッセージを自動的に適切な形式で表示
    const { title, description, type } = getToastMessage(error);
    
    if (type === 'error') {
      toast.error(\`\${title}: \${description}\`);
    } else {
      toast(\`\${title}: \${description}\`, { icon: '⚠️' });
    }
    
    throw error;
  }
}
`;