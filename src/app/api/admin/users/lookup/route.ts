import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/requireAdmin';
import { prisma } from '@/lib/prisma';
import { formatPhoneNumber, getPhoneVariations } from '@/lib/utils/phoneUtils';
import type { UserLookupRequest, UserLookupResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    await requireAdmin(request);
    
    const { phone }: UserLookupRequest = await request.json();
    
    if (!phone) {
      return NextResponse.json({
        success: false,
        error: 'Phone number is required'
      }, { status: 400 });
    }
    
    // Get standardized phone number and all variations for lookup
    const standardizedPhone = formatPhoneNumber(phone);
    if (!standardizedPhone) {
      return NextResponse.json<UserLookupResponse>({
        success: false,
        user: null,
        message: 'Invalid phone number format'
      });
    }
    
    const phoneVariations = getPhoneVariations(phone);
    
    // Search for user by any of the phone number variations
    const user = await prisma.user.findFirst({
      where: {
        phone: {
          in: phoneVariations
        },
        isDelete: false
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (user) {
      // If user found but phone is not in standard format, update it
      if (user.phone !== standardizedPhone) {
        await prisma.user.update({
          where: { id: user.id },
          data: { phone: standardizedPhone }
        });
        
        // Return updated user data
        return NextResponse.json<UserLookupResponse>({
          success: true,
          user: {
            ...user,
            phone: standardizedPhone,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString()
          },
          message: 'User found and phone number standardized'
        });
      }
      
      return NextResponse.json<UserLookupResponse>({
        success: true,
        user: {
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString()
        },
        message: 'User found'
      });
    } else {
      return NextResponse.json<UserLookupResponse>({
        success: false,
        user: null,
        message: 'User not found'
      });
    }
    
  } catch (error) {
    console.error('User lookup error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
