import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/requireAdmin';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const adminCheck = await requireAdmin(request);
    if (adminCheck instanceof NextResponse) return adminCheck;

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    
    if (!query || query.length < 2) {
      return NextResponse.json({
        success: false,
        users: [],
        message: 'Query must be at least 2 characters'
      });
    }
    
    // Search for users by name (case-insensitive)
    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            fullName: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            phone: {
              contains: query
            }
          }
        ],
        isDelete: false
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        role: true
      },
      take: 10, // Limit to 10 results
      orderBy: {
        fullName: 'asc'
      }
    });
    
    return NextResponse.json({
      success: true,
      users,
      message: `Found ${users.length} users`
    });
    
  } catch (error) {
    console.error('User search error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
