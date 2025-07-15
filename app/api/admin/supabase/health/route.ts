import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/supabase/admin-helpers';

export async function GET() {
  try {
    const health = await checkDatabaseHealth();
    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check database health' },
      { status: 500 }
    );
  }
}