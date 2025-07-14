import { NextResponse } from 'next/server';
import { getDatabaseStats } from '@/lib/supabase/admin-helpers';

export async function GET() {
  try {
    const stats = await getDatabaseStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch database stats' },
      { status: 500 }
    );
  }
}