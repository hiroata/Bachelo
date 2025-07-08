import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { scheduledCleanup } from '@/lib/storage/cleanup'

export async function GET(request: Request) {
  // セキュリティ: Vercel Cronまたは管理者のみアクセス可能
  const authHeader = headers().get('authorization')
  
  // Vercel Cronトークンまたは管理者トークンをチェック
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const result = await scheduledCleanup()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Cleanup failed:', error)
    return NextResponse.json(
      { error: 'Cleanup failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}