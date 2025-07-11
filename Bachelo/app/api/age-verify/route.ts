import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { isAdult } = await request.json()
    
    if (!isAdult) {
      return NextResponse.json({ redirect: 'https://www.google.com' })
    }
    
    // 年齢確認済みのクッキーを設定
    const response = NextResponse.json({ success: true })
    
    // セキュアなクッキー設定
    response.cookies.set({
      name: 'age-verified',
      value: 'true',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30, // 30日間
      path: '/'
    })
    
    return response
  } catch (error) {
    console.error('Age verification error:', error)
    return NextResponse.json(
      { error: '年齢確認処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}