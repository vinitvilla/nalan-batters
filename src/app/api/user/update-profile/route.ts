import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { adminAuth } from "@/lib/firebase/firebase-admin";

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
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

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
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Prepare update data
  const updateData: any = {};
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

  return NextResponse.json(updatedUser);
}
