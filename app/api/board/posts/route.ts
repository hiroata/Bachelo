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
    
    const supabase = createAnonClient();
    
    let query = supabase
      .from('board_posts')
      .select(`
        *,
        category:board_categories(*),
        images:board_post_images(*),
        replies:board_replies(count)
      `, { count: 'exact' })
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (category_id) {
      query = query.eq('category_id', category_id);
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }
    
    const from = (page - 1) * per_page;
    const to = from + per_page - 1;
    
    const { data: posts, error, count } = await query.range(from, to);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    const total_pages = Math.ceil((count || 0) / per_page);
    
    return NextResponse.json({
      posts: posts || [],
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