import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authMiddleware } from '@/middlewares/auth-middleware';
import { loggerMiddleware } from '@/middlewares/logger-middleware';

export const runtime = 'nodejs';

export function middleware(request: NextRequest) {
  const authResponse = authMiddleware(request);
  if (authResponse) return authResponse;

  const requestHeaders = new Headers(request.headers);
  loggerMiddleware(request, requestHeaders);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
