import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// DELETE /api/posts/[id] - 投稿削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = parseInt(params.id)
    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json(
        { error: '削除パスワードを入力してください' },
        { status: 400 }
      )
    }

    // 投稿を取得
    const post = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      return NextResponse.json(
        { error: '投稿が見つかりません' },
        { status: 404 }
      )
    }

    // パスワード検証
    if (!post.deletePassword) {
      return NextResponse.json(
        { error: 'この投稿は削除できません' },
        { status: 403 }
      )
    }

    const isValidPassword = await bcrypt.compare(password, post.deletePassword)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'パスワードが間違っています' },
        { status: 403 }
      )
    }

    // 論理削除（本文を「削除されました」に更新）
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        body: 'あぼーん',
        name: '削除',
        email: null,
        trip: null
      }
    })

    return NextResponse.json({ message: '投稿を削除しました' })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: '投稿の削除に失敗しました' },
      { status: 500 }
    )
  }
}