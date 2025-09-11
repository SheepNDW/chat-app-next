import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // 允許不需要登入的路徑
  const publicPaths = ['/', '/login'];
  const isPublic =
    publicPaths.includes(pathname) ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/assets');

  if (isPublic) return NextResponse.next();

  // req.auth 由 NextAuth 注入；若無 session 則導向登入
  if (!req.auth) {
    const loginUrl = new URL('/login', req.nextUrl.origin);
    // 保留 callbackUrl 回跳
    loginUrl.searchParams.set('callbackUrl', pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
});

// Matcher: 排除靜態資源，處理所有其他路徑
export const config = {
  matcher: [
    // 參考官方寫法，排除 _next 靜態、圖片、favicon 等
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
