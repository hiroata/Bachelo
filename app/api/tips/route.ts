import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { z } from 'zod';

const createTipSchema = z.object({
  to_user_id: z.string().uuid(),
  amount: z.number().min(100),
  message: z.string().optional(),
  post_id: z.string().uuid().optional(),
  voice_post_id: z.string().uuid().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createTipSchema.parse(body);
    
    const supabase = createRouteHandlerClient();
    
    // 現在のユーザーを取得（匿名の場合はnull）
    const { data: { session } } = await supabase.auth.getSession();
    const from_user_id = session?.user?.id || null;
    
    // 投げ銭レコードを作成
    const { data: tip, error: tipError } = await supabase
      .from('tips')
      .insert({
        from_user_id,
        to_user_id: validatedData.to_user_id,
        amount: validatedData.amount,
        message: validatedData.message,
        post_id: validatedData.post_id,
        voice_post_id: validatedData.voice_post_id,
        status: 'completed', // 開発環境では即時完了
        processed_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (tipError) {
      console.error('Tip creation error:', tipError);
      return NextResponse.json({ error: tipError.message }, { status: 500 });
    }
    
    // クリエイター収益レコードを作成
    const platformFee = Math.floor(validatedData.amount * 0.3); // 30%手数料
    const netAmount = validatedData.amount - platformFee;
    
    const { error: earningsError } = await supabase
      .from('creator_earnings')
      .insert({
        user_id: validatedData.to_user_id,
        source_type: 'tip',
        source_id: tip.id,
        amount: validatedData.amount,
        platform_fee: platformFee,
        net_amount: netAmount,
        status: 'available',
        available_at: new Date().toISOString()
      });
    
    if (earningsError) {
      console.error('Earnings creation error:', earningsError);
    }
    
    return NextResponse.json({ 
      success: true, 
      tip: {
        id: tip.id,
        amount: tip.amount,
        net_amount: netAmount
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error processing tip:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}