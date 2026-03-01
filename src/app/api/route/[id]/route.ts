import { NextRequest, NextResponse } from 'next/server';
import logger, { logDebug, logWarn } from '@/lib/logger'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Decode the route data from the base64 encoded ID
    const routeData = JSON.parse(atob(id));

    // Validate expected structure to prevent arbitrary data reflection
    if (!routeData || typeof routeData !== 'object' || !routeData.origin || !routeData.destination) {
      logWarn(request.logger, { endpoint: 'GET /api/route/[id]', action: 'invalid_route_data' });
      return NextResponse.json(
        { success: false, error: 'Invalid route data structure' },
        { status: 400 }
      );
    }

    logDebug(request.logger, { endpoint: 'GET /api/route/[id]', action: 'route_decoded' });
    return NextResponse.json({
      success: true,
      route: routeData
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      logger.error({ endpoint: 'GET /api/route/[id]', action: 'route_decode_failed', error: error instanceof Error ? error.message : 'Unknown error' });
    }
    return NextResponse.json(
      { success: false, error: 'Invalid route ID' },
      { status: 400 }
    );
  }
}
