import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from '@/shared/utils/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page without authentication
  if (pathname === '/login') {
    return NextResponse.next();
  }

  // Get session token from cookies
  const token = request.cookies.get('session_token')?.value;

  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify token validity
  try {
    const payload = await verifySession(token);
    if (!payload) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  } catch (err) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|brand|favicon.ico).*)',
  ],
};
