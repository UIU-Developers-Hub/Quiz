// src/proxy.ts  (replaces middleware.ts for Next.js 16.x)
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  // Public paths that don't require login
  const publicPaths = ['/', '/login', '/register', '/api/auth', '/api/quizzes', '/api/leaderboard']
  const isPublic = publicPaths.some(p =>
    pathname === p || pathname.startsWith(p + '/')
  )

  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
