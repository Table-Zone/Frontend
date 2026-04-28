import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  // Public paths that don't require auth
  const publicPaths = ['/', '/login', '/register', '/invite'];
  const isPublicPath = publicPaths.some((path) => pathname === path || pathname.startsWith('/invite/'));

  // Auth paths that should redirect to dashboard if already logged in
  const authPaths = ['/login', '/register'];
  const isAuthPath = authPaths.includes(pathname);

  if (isAuthPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|uploads|logo).*)'],
};
