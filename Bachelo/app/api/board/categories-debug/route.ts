import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('Debug: Starting categories-debug endpoint');
    
    // 環境変数の確認
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('Debug: Environment variables check');
    console.log('SUPABASE_URL exists:', !!supabaseUrl);
    console.log('SUPABASE_ANON_KEY exists:', !!supabaseAnonKey);
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ 
        error: 'Missing environment variables',
        supabaseUrl: !!supabaseUrl,
        supabaseAnonKey: !!supabaseAnonKey
      }, { status: 500 });
    }
    
    // Supabaseクライアントを直接作成
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Debug: Supabase client created');
    
    // クエリ実行
    const { data: categories, error } = await supabase
      .from('board_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    console.log('Debug: Query executed');
    console.log('Debug: Error:', error);
    console.log('Debug: Categories count:', categories?.length);
    console.log('Debug: First category:', categories?.[0]);
    
    if (error) {
      return NextResponse.json({ 
        error: 'Database error',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }
    
    // 成功レスポンス
    return NextResponse.json({
      success: true,
      count: categories?.length || 0,
      data: categories || []
    });
    
  } catch (error) {
    console.error('Debug: Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}