import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';
import crypto from 'crypto';
import { checkNgWords, logNgWordDetection } from '@/lib/utils/ng-word-checker';

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
    
    // IPアドレスとユーザーエージェントを取得
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    const user_agent = request.headers.get('user-agent') || 'unknown';
    
    // IPアドレスをハッシュ化
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex');
    
    // NGワードチェック
    const contentCheck = await checkNgWords(sanitizedContent);
    
    // NGワードが含まれている場合
    if (!contentCheck.isClean) {
      // 重大なNGワードが含まれている場合は返信を拒否
      if (contentCheck.shouldBlock) {
        // NGワード検出をログに記録
        await logNgWordDetection(
          'board_reply',
          'blocked',
          contentCheck.detectedWords.map(w => w.word),
          contentCheck.highestSeverity!,
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
    
    const supabase = createRouteHandlerClient();
    
    const { data: reply, error } = await supabase
      .from('board_replies')
      .insert({
        ...validatedData,
        content: sanitizedContent,
        ip_address: ipHash,
        user_agent,
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // 軽度のNGワードが検出された場合はログに記録（返信は許可）
    if (!contentCheck.isClean) {
      await logNgWordDetection(
        'board_reply',
        reply.id,
        contentCheck.detectedWords.map(w => w.word),
        contentCheck.highestSeverity!,
        'flagged',
        ipHash
      );
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