import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const ageVerified = request.cookies.get('age_verified')
  const pathname = request.nextUrl.pathname
  
  // Allow access to auth pages, API routes, and static files
  const allowedPaths = [
    '/age-gate',
    '/api',
    '/_next',
    '/favicon.ico',
  ]
  
  const isAllowedPath = allowedPaths.some(path => pathname.startsWith(path))
  
  // If age not verified and trying to access protected route
  if (!ageVerified && !isAllowedPath) {
    return NextResponse.redirect(new URL('/age-gate', request.url))
  }
  
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