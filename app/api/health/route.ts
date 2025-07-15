import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const startTime = Date.now()
  
  // データベース接続チェック
  let dbStatus = 'unknown'
  let dbLatency = 0
  
  try {
    const dbStartTime = Date.now()
    const supabase = createClient()
    
    // シンプルなクエリでデータベース接続を確認
    const { error } = await supabase
      .from('board_categories')
      .select('id')
      .limit(1)
    
    dbLatency = Date.now() - dbStartTime
    dbStatus = error ? 'error' : 'healthy'
  } catch (error) {
    dbStatus = 'error'
    console.error('Health check DB error:', error)
  }
  
  const totalLatency = Date.now() - startTime
  
  // Renderのヘルスチェックは200 OKを期待
  const isHealthy = dbStatus === 'healthy'
  
  return NextResponse.json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    uptime: process.uptime(),
    checks: {
      database: {
        status: dbStatus,
        latency: `${dbLatency}ms`
      },
      server: {
        status: 'healthy',
        memory: {
          used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
          total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
        }
      }
    },
    latency: `${totalLatency}ms`
  }, {
    status: isHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  })
}