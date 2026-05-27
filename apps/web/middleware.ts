import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  // Public paths that don't require auth
  const publicPaths = ['/', '/login', '/register', '/invite', '/verify-email', '/forgot-password', '/reset-password', '/admin-login', '/privacy', '/terms', '/eula'];
  const isPublicPath = publicPaths.some((path) => pathname === path || pathname.startsWith('/invite/')) || pathname.startsWith('/menu/');

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
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|uploads|logo|.*\\.jpg|.*\\.jpeg|.*\\.png|.*\\.svg|.*\\.webp|.*\\.gif|sw\\.js).*)'],
};
