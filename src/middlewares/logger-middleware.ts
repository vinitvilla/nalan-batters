import type { NextRequest } from 'next/server';
import { createRequestLogger } from '@/lib/logger';
import { setRequestLogger } from '@/lib/request-context';

export function loggerMiddleware(request: NextRequest, requestHeaders: Headers): void {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api')) {
    const requestId = crypto.randomUUID();
    const requestLogger = createRequestLogger(request, `${request.method} ${pathname}`);
    setRequestLogger(requestId, requestLogger);
    requestHeaders.set('x-request-id', requestId);
  }
}
