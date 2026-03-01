import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { adminAuth } from "@/lib/firebase/firebase-admin";
import { logError, logInfo, logWarn } from "@/lib/logger"

export async function PATCH(req: NextRequest) {
  // Get and verify auth token
  const token = (await cookies()).get("auth-token")?.value;
  if (!token) {
    return NextResponse.json({ error: "No token" }, { status: 401 });
  }

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(token);
  } catch {
    logWarn(req.logger, { endpoint: 'PATCH /api/user/update-profile', action: 'auth_failed', reason: 'invalid_token' });
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    // Get update data from request
    const { fullName, phone } = await req.json();

    // Validate input
    if (!fullName && !phone) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    // Find the current user
    const currentUser = await prisma.user.findFirst({
      where: {
        phone: decoded.phone_number,
        isDelete: false
      },
    });

    if (!currentUser) {
      logWarn(req.logger, { endpoint: 'PATCH /api/user/update-profile', action: 'user_not_found', phone: decoded.phone_number });
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData: { fullName?: string; phone?: string } = {};
    if (fullName) updateData.fullName = fullName;
    if (phone && phone !== currentUser.phone) {
      // Check if new phone number is already in use
      const existingUser = await prisma.user.findFirst({
        where: {
          phone,
          isDelete: false,
          id: { not: currentUser.id }
        }
      });

      if (existingUser) {
        logWarn(req.logger, { endpoint: 'PATCH /api/user/update-profile', action: 'phone_already_in_use', phone });
        return NextResponse.json({ error: "Phone number already in use" }, { status: 400 });
      }
      updateData.phone = phone;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: updateData,
      include: {
        addresses: {
          where: { isDeleted: false },
        },
        defaultAddress: {
          where: { isDeleted: false },
        },
      },
    });

    logInfo(req.logger, { endpoint: 'PATCH /api/user/update-profile', action: 'profile_updated', userId: currentUser.id, fieldsUpdated: Object.keys(updateData) });
    return NextResponse.json(updatedUser);
  } catch (error) {
    logError(req.logger, error, { endpoint: 'PATCH /api/user/update-profile', action: 'profile_update_failed' });
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
