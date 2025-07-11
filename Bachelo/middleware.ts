import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 年齢確認ページ自体へのアクセスは許可
  if (pathname === '/age-gate') {
    return NextResponse.next()
  }
  
  // 認証関連ページへのアクセスは許可
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    return NextResponse.next()
  }
  
  // 年齢確認済みかチェック
  const ageVerified = request.cookies.get('age-verified')
  
  // 年齢確認していない場合は年齢確認ページへリダイレクト
  if (!ageVerified || ageVerified.value !== 'true') {
    const url = request.nextUrl.clone()
    url.pathname = '/age-gate'
    return NextResponse.redirect(url)
  }
  
  // 年齢確認済みの場合は通常通り処理
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}