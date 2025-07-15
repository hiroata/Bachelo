import { NextResponse } from 'next/server';
import { getStorageDetails } from '@/lib/supabase/admin-helpers';

export async function GET() {
  try {
    const storage = await getStorageDetails();
    return NextResponse.json(storage);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch storage details' },
      { status: 500 }
    );
  }
}