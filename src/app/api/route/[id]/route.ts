import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Decode the route data from the base64 encoded ID
    const routeData = JSON.parse(atob(id));
    
    return NextResponse.json({ 
      success: true, 
      route: routeData 
    });
  } catch (error) {
    console.error('Error decoding route:', error);
    return NextResponse.json(
      { success: false, error: 'Invalid route ID' },
      { status: 400 }
    );
  }
}
