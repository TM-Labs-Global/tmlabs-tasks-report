import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from '@/shared/utils/session';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Exclude public assets, static files, and authentication API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/public') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js|woff|woff2)$/)
  ) {
    return NextResponse.next();
  }

  // Allow visiting the login page
  if (pathname === '/login') {
    const token = request.cookies.get('session_token')?.value;
    if (token) {
      const isValid = await verifySession(token);
      if (isValid) {
        // If already logged in, redirect to home page
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
    return NextResponse.next();
  }

  // 2. Protect all other paths
  const token = request.cookies.get('session_token')?.value;

  if (!token) {
    // If it's an API request, return unauthorized JSON
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized. Session cookie missing.' }, { status: 401 });
    }
    // Otherwise, redirect to login page
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify the JWT-like session token natively in the Edge
  const session = await verifySession(token);

  if (!session) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized. Session expired or invalid.' }, { status: 401 });
    }
    
    // Clear invalid session cookie and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('session_token');
    return response;
  }

  // Session is valid, allow request to proceed
  return NextResponse.next();
}

// Config to specify matching routes
export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
