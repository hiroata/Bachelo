import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient();
    
    // Test 1: Check if we can connect to Supabase
    const { data: testConnection, error: connectionError } = await supabase
      .from('board_categories')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      return NextResponse.json({
        success: false,
        test: 'connection',
        error: connectionError.message,
        details: connectionError
      }, { status: 500 });
    }
    
    // Test 2: Fetch categories
    const { data: categories, error: categoriesError } = await supabase
      .from('board_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    if (categoriesError) {
      return NextResponse.json({
        success: false,
        test: 'categories_fetch',
        error: categoriesError.message,
        details: categoriesError
      }, { status: 500 });
    }
    
    // Test 3: Check table structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('board_categories')
      .select('*')
      .limit(0);
    
    return NextResponse.json({
      success: true,
      tests: {
        connection: 'OK',
        categories_fetch: 'OK',
        table_exists: 'OK'
      },
      data: {
        categories_count: categories?.length || 0,
        categories: categories || []
      }
    });
    
  } catch (error) {
    console.error('Board check error:', error);
    return NextResponse.json({
      success: false,
      test: 'general',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 });
  }
}