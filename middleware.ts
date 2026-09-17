import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from '@/shared/utils/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Exclude public assets, static files, and authentication API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/api/migrate' ||
    pathname === '/api/keepalive' ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/public') ||
    pathname.startsWith('/brand') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js|woff|woff2|mp4|webm)$/)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('session_token')?.value;

  // Allow visiting the login page
  if (pathname === '/login') {
    if (token) {
      const session = await verifySession(token);
      if (session) {
        const role = session.role || 'staff';
        if (role === 'staff') {
          return NextResponse.redirect(new URL('/mytasks', request.url));
        } else {
          return NextResponse.redirect(new URL('/', request.url));
        }
      }
    }
    return NextResponse.next();
  }

  // 2. Protect all other paths
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized. Session cookie missing.' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify the session token
  const session = await verifySession(token);

  if (!session) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized. Session expired or invalid.' }, { status: 401 });
    }
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('session_token');
    return response;
  }

  // 3. Enforce Role-Based Access Control
  const role = session.role || 'staff';

  if (role === 'staff') {
    const isAllowedForStaff =
      pathname === '/mytasks' ||
      pathname === '/calendar' ||
      pathname === '/settings' ||
      pathname.startsWith('/workspace/') ||
      pathname.startsWith('/tasks/') ||
      pathname.startsWith('/api/');

    if (!isAllowedForStaff) {
      return NextResponse.redirect(new URL('/mytasks', request.url));
    }
  } else if (role === 'stakeholder') {
    const isAllowedForStakeholder =
      pathname === '/' ||
      pathname === '/reporting' ||
      pathname === '/projects' ||
      pathname === '/team' ||
      pathname === '/settings' ||
      pathname.startsWith('/api/');

    if (!isAllowedForStakeholder) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
