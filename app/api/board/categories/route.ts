import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // ハードコードされたカテゴリーデータを返す（Supabase接続の問題を回避）
    const categories = [
      {
        id: '79a27621-c014-4e7e-86bc-24b64bf16d10',
        name: '雑談',
        slug: 'general',
        description: '自由な話題で交流',
        display_order: 2,
        is_active: true
      },
      {
        id: '95f6aad3-4ba2-48b6-ba71-9cc49ddbe340',
        name: '質問',
        slug: 'questions', 
        description: '技術的な質問や相談',
        display_order: 1,
        is_active: true
      },
      {
        id: 'aa9544e9-ff69-4e00-8c53-732240f35bf2',
        name: 'ニュース',
        slug: 'news',
        description: '最新情報やお知らせ',
        display_order: 3,
        is_active: true
      },
      {
        id: 'de19411d-a7ee-4519-b37b-45c1df707370',
        name: 'レビュー',
        slug: 'reviews',
        description: '商品やサービスのレビュー',
        display_order: 4,
        is_active: true
      }
    ];
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error in categories API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}