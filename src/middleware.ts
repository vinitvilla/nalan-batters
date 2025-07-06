import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  console.log('Middleware triggered for:', request.nextUrl.pathname);
  if (request.nextUrl.pathname.startsWith('/admin')) {
    console.log('Checking authentication for admin route:', request.nextUrl.pathname);
    // Check for token in cookie or Authorization header
    const cookieToken = request.cookies.get('auth-token');
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;
    const token = cookieToken || bearerToken;
    if (!token) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }
  }
  console.log('No authentication issues, proceeding with request:', request.nextUrl.pathname);
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
