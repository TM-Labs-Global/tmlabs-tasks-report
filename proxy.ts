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
    pathname.startsWith('/brand') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js|woff|woff2)$/)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('session_token')?.value;

  // Allow visiting the login page
  if (pathname === '/login') {
    if (token) {
      const session = await verifySession(token);
      if (session) {
        // If already logged in, redirect to role-based home page
        const role = session.role || 'staff';
        if (role === 'staff') {
          return NextResponse.redirect(new URL('/mytasks', request.url));
        } else if (role === 'stakeholder') {
          return NextResponse.redirect(new URL('/reporting', request.url));
        } else {
          return NextResponse.redirect(new URL('/', request.url));
        }
      }
    }
    return NextResponse.next();
  }

  // 2. Protect all other paths
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

  // 3. Enforce Role-Based Access Control
  const role = session.role || 'staff';

  if (role === 'staff') {
    const isAllowedForStaff =
      pathname === '/mytasks' ||
      pathname.startsWith('/tasks/') ||
      pathname === '/calendar' ||
      pathname === '/settings' ||
      pathname.startsWith('/api/');

    if (!isAllowedForStaff) {
      return NextResponse.redirect(new URL('/mytasks', request.url));
    }
  } else if (role === 'stakeholder') {
    const isAllowedForStakeholder =
      pathname === '/' ||
      pathname === '/reporting' ||
      pathname === '/settings' ||
      pathname.startsWith('/api/');

    if (!isAllowedForStakeholder) {
      return NextResponse.redirect(new URL('/reporting', request.url));
    }
  }

  // Session is valid and authorized, allow request to proceed
  return NextResponse.next();
}

// Config to specify matching routes
export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
