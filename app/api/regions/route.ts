import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/regions - 全ての地方と、それに属するエリアの一覧を取得
export async function GET() {
  try {
    const regions = await prisma.region.findMany({
      orderBy: { order: 'asc' },
      include: {
        areas: {
          orderBy: { name: 'asc' }
        }
      }
    })

    return NextResponse.json(regions)
  } catch (error) {
    console.error('Error fetching regions:', error)
    return NextResponse.json(
      { error: '地域一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}