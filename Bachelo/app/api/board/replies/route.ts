import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

const createReplySchema = z.object({
  post_id: z.string().uuid(),
  parent_reply_id: z.string().uuid().optional(),
  author_name: z.string().min(1).max(100),
  author_email: z.string().email().optional(),
  content: z.string().min(1).max(5000),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createReplySchema.parse(body);
    
    // HTMLサニタイズ
    const sanitizedContent = DOMPurify.sanitize(validatedData.content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'blockquote'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
    });
    
    const supabase = createRouteHandlerClient();
    
    // IPアドレスとユーザーエージェントを取得
    const ip_address = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const user_agent = request.headers.get('user-agent') || 'unknown';
    
    const { data: reply, error } = await supabase
      .from('board_replies')
      .insert({
        ...validatedData,
        content: sanitizedContent,
        ip_address,
        user_agent,
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(reply, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error creating reply:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}