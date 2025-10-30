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

  // Get addressId from request
  const { addressId } = await req.json();

  // Validate input
  if (!addressId) {
    return NextResponse.json({ error: "Address ID is required" }, { status: 400 });
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

  // Verify the address belongs to the user
  const address = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId: currentUser.id,
      isDeleted: false,
    },
  });

  if (!address) {
    return NextResponse.json({ error: "Address not found or does not belong to user" }, { status: 404 });
  }

  // Update user's default address
  const updatedUser = await prisma.user.update({
    where: { id: currentUser.id },
    data: { defaultAddressId: addressId },
    include: {
      defaultAddress: {
        where: { isDeleted: false },
      },
    },
  });

  return NextResponse.json(updatedUser.defaultAddress);
}
