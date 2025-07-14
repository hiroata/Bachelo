import { NextResponse } from 'next/server';
import { cleanupOldData } from '@/lib/supabase/admin-helpers';

export async function POST() {
  try {
    const result = await cleanupOldData(7); // 7日以上前のデータ
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to cleanup old data' },
      { status: 500 }
    );
  }
}