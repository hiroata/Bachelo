import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // ハードコードされたデータを返す
  const mockCategories = [
    { id: '1', name: '画像', slug: 'images', is_active: true, display_order: 10 },
    { id: '2', name: '動画', slug: 'videos', is_active: true, display_order: 20 },
    { id: '3', name: '音声', slug: 'audio', is_active: true, display_order: 30 },
  ];
  
  return NextResponse.json(mockCategories);
}