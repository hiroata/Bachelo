import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateThreadTitle, validatePostBody } from '@/utils/validation'
import { extractTripKey, generateTrip } from '@/utils/trip'
import { generateUserId } from '@/utils/userId'
import bcrypt from 'bcryptjs'

// GET /api/threads - スレッド一覧取得
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const areaSlug = searchParams.get('area')
    const skip = (page - 1) * limit

    // エリアフィルタリング用の条件
    let whereCondition = {}
    if (areaSlug) {
      const area = await prisma.area.findUnique({
        where: { slug: areaSlug }
      })
      if (!area) {
        return NextResponse.json(
          { error: 'エリアが見つかりません' },
          { status: 404 }
        )
      }
      whereCondition = { areaId: area.id }
    }

    const [threads, total] = await Promise.all([
      prisma.thread.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          area: true,
          _count: {
            select: { posts: true }
          }
        }
      }),
      prisma.thread.count({ where: whereCondition })
    ])

    return NextResponse.json({
      threads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching threads:', error)
    return NextResponse.json(
      { error: 'スレッド一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST /api/threads - 新規スレッド作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, name, email, postBody, deletePassword, areaId } = body

    // バリデーション
    if (!areaId) {
      return NextResponse.json({ error: 'エリアIDが必要です' }, { status: 400 })
    }

    const titleError = validateThreadTitle(title)
    if (titleError) {
      return NextResponse.json({ error: titleError }, { status: 400 })
    }

    const bodyError = validatePostBody(postBody)
    if (bodyError) {
      return NextResponse.json({ error: bodyError }, { status: 400 })
    }

    // エリアの存在確認
    const area = await prisma.area.findUnique({
      where: { id: areaId }
    })
    if (!area) {
      return NextResponse.json({ error: 'エリアが見つかりません' }, { status: 404 })
    }

    // IPアドレス取得（実際の実装ではヘッダーから取得）
    const ipAddress = request.headers.get('x-forwarded-for') || '127.0.0.1'

    // トリップ処理
    const { name: cleanName, tripKey } = extractTripKey(name || '')
    const trip = tripKey ? generateTrip(tripKey) : null

    // ユーザーID生成
    const userId = generateUserId(ipAddress)

    // 削除パスワードのハッシュ化
    const hashedPassword = deletePassword 
      ? await bcrypt.hash(deletePassword, 10)
      : null

    // トランザクションでスレッドと最初の投稿を作成
    const thread = await prisma.thread.create({
      data: {
        title,
        areaId,
        posts: {
          create: {
            postNumber: 1,
            name: cleanName || '名無しさん',
            email,
            body: postBody,
            trip,
            userId,
            deletePassword: hashedPassword,
            ipAddress
          }
        }
      },
      include: {
        area: true,
        posts: true
      }
    })

    return NextResponse.json(thread, { status: 201 })
  } catch (error) {
    console.error('Error creating thread:', error)
    return NextResponse.json(
      { error: 'スレッドの作成に失敗しました' },
      { status: 500 }
    )
  }
}