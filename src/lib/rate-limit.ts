import { NextRequest, NextResponse } from 'next/server';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Initialize rate limiter with default options
// 10 points per 1 second by default
const rateLimiter = new RateLimiterMemory({
  points: 10,
  duration: 1,
});

export const rateLimit = async (req: NextRequest) => {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';

  try {
    await rateLimiter.consume(ip);
    return null; // Rate limit check passed
  } catch (rej: unknown) {
    if (rej instanceof Error) throw rej; // Should not happen with RateLimiterMemory

    // Rate limit exceeded
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': '1',
      },
    });
  }
};

type NextRouteContext = { params?: Promise<Record<string, string>> };

/**
 * Higher-order function to wrap API routes with rate limiting
 * @param handler The API route handler
 * @returns A wrapped handler with rate limiting
 */
export function withRateLimit(handler: (req: NextRequest, context?: NextRouteContext) => Promise<NextResponse>) {
  return async (req: NextRequest, context?: NextRouteContext) => {
    // Check rate limit
    const rateLimitResponse = await rateLimit(req);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Proceed to actual handler
    return handler(req, context);
  };
}
