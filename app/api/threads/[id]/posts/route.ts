import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validatePostBody } from '@/utils/validation'
import { extractTripKey, generateTrip } from '@/utils/trip'
import { generateUserId } from '@/utils/userId'
import { isSage } from '@/utils/validation'
import bcrypt from 'bcryptjs'

// POST /api/threads/[id]/posts - スレッドにレス投稿
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const threadId = parseInt(params.id)
    const body = await request.json()
    const { name, email, postBody, deletePassword } = body

    // バリデーション
    const bodyError = validatePostBody(postBody)
    if (bodyError) {
      return NextResponse.json({ error: bodyError }, { status: 400 })
    }

    // スレッドの存在確認
    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      include: {
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

    // 次の投稿番号を取得
    const nextPostNumber = thread._count.posts + 1

    // IPアドレス取得
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

    // sage判定
    const sage = isSage(email)

    // トランザクションで投稿作成とスレッド更新
    const result = await prisma.$transaction(async (tx) => {
      // 投稿作成
      const post = await tx.post.create({
        data: {
          threadId,
          postNumber: nextPostNumber,
          name: cleanName || '名無しさん',
          email,
          body: postBody,
          trip,
          userId,
          deletePassword: hashedPassword,
          ipAddress
        }
      })

      // sageでなければスレッドのupdatedAtを更新
      if (!sage) {
        await tx.thread.update({
          where: { id: threadId },
          data: { updatedAt: new Date() }
        })
      }

      return post
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: '投稿の作成に失敗しました' },
      { status: 500 }
    )
  }
}