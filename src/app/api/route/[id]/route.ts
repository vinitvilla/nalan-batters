import { NextRequest, NextResponse } from 'next/server';

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
      return NextResponse.json(
        { success: false, error: 'Invalid route data structure' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      route: routeData
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Error decoding route:', error);
    }
    return NextResponse.json(
      { success: false, error: 'Invalid route ID' },
      { status: 400 }
    );
  }
}
