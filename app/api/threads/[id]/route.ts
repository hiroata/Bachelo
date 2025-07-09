import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/threads/[id] - 特定スレッドの投稿一覧取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const threadId = parseInt(params.id)
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '1000')
    const skip = (page - 1) * limit

    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      include: {
        area: {
          include: {
            region: true
          }
        },
        posts: {
          skip,
          take: limit,
          orderBy: { postNumber: 'asc' }
        },
        _count: {
          select: { posts: true }
        }
      }
    })

    if (!thread) {
      return NextResponse.json(
        { error: 'スレッドが見つかりません' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      thread,
      pagination: {
        page,
        limit,
        total: thread._count.posts,
        totalPages: Math.ceil(thread._count.posts / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching thread:', error)
    return NextResponse.json(
      { error: 'スレッドの取得に失敗しました' },
      { status: 500 }
    )
  }
}