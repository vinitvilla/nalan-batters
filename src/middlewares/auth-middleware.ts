import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function authMiddleware(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const cookieToken = request.cookies.get('auth-token');
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const token = cookieToken || bearerToken;

    if (!token) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }
  }

  return null;
}
