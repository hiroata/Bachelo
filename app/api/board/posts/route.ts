import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';
import { postRateLimiter } from '@/lib/utils/rate-limiter';
import crypto from 'crypto';
import { checkNgWords, logNgWordDetection } from '@/lib/utils/ng-word-checker';

export const dynamic = 'force-dynamic';

const createPostSchema = z.object({
  category_id: z.string().uuid(),
  author_name: z.string().min(1).max(100),
  author_email: z.string().email().optional(),
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(10000),
  region: z.string().optional().default('全国'),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const per_page = parseInt(searchParams.get('per_page') || '20');
    const category_id = searchParams.get('category_id');
    const search = searchParams.get('search');
    const region = searchParams.get('region');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    let query = supabase
      .from('board_posts')
      .select(`
        *,
        category:board_categories(*),
        images:board_post_images(*)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });
    
    if (category_id) {
      query = query.eq('category_id', category_id);
    }
    
    if (region) {
      query = query.eq('region', region);
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }
    
    const from = (page - 1) * per_page;
    const to = from + per_page - 1;
    
    const { data: posts, error, count } = await query.range(from, to);
    
    if (error) {
      console.error('Board posts query error:', error);
      return NextResponse.json({ 
        error: error.message,
        details: {
          code: error.code,
          hint: error.hint,
          table: 'board_posts'
        }
      }, { status: 500 });
    }
    
    const total_pages = Math.ceil((count || 0) / per_page);
    
    // Use the existing reply_count column from board_posts table
    const postsWithReplyCounts = (posts || []).map(post => ({
      ...post,
      replies_count: post.reply_count || 0
    }));
    
    return NextResponse.json({
      posts: postsWithReplyCounts,
      total: count || 0,
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
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    
    if (!postRateLimiter.isAllowed(ip)) {
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
    
    // IPアドレスをハッシュ化
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex');
    
    // NGワードチェック
    const titleCheck = await checkNgWords(sanitizedTitle);
    const contentCheck = await checkNgWords(sanitizedContent);
    
    // タイトルまたは本文にNGワードが含まれている場合
    if (!titleCheck.isClean || !contentCheck.isClean) {
      const allDetectedWords = [...titleCheck.detectedWords, ...contentCheck.detectedWords];
      const highestSeverity = titleCheck.highestSeverity || contentCheck.highestSeverity;
      
      // 重大なNGワードが含まれている場合は投稿を拒否
      if (titleCheck.shouldBlock || contentCheck.shouldBlock) {
        // NGワード検出をログに記録
        await logNgWordDetection(
          'board_post',
          'blocked', // まだIDがないので一時的な値
          allDetectedWords.map(w => w.word),
          highestSeverity!,
          'blocked',
          ipHash
        );
        
        return NextResponse.json(
          { 
            error: '禁止されている言葉が含まれています。内容を修正してください。',
            code: 'NG_WORD_DETECTED'
          },
          { status: 400 }
        );
      }
    }
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // ユーザーエージェントを取得
    const user_agent = request.headers.get('user-agent') || 'unknown';
    
    const { data: post, error } = await supabase
      .from('board_posts')
      .insert({
        ...validatedData,
        title: sanitizedTitle,
        content: sanitizedContent,
        ip_address: ipHash,
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
    
    // 軽度のNGワードが検出された場合はログに記録（投稿は許可）
    if (!titleCheck.isClean || !contentCheck.isClean) {
      const allDetectedWords = [...titleCheck.detectedWords, ...contentCheck.detectedWords];
      const highestSeverity = titleCheck.highestSeverity || contentCheck.highestSeverity;
      
      await logNgWordDetection(
        'board_post',
        post.id,
        allDetectedWords.map(w => w.word),
        highestSeverity!,
        'flagged',
        ipHash
      );
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