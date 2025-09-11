import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  if (!req.auth) {
    const loginUrl = new URL('/login', req.nextUrl.origin);
    // 回跳保留完整 path + query
    loginUrl.searchParams.set(
      'callbackUrl',
      req.nextUrl.pathname + req.nextUrl.search
    );
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/chats', // /chats
    '/chats/:path*', // /chats/[id]
    '/projects/:path*', // /projects/[projectId] 以及子層 chats
  ],
};
