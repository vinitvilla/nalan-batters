import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Create a new address and set as default for user
export async function POST(req: NextRequest) {
  const { userId, street, unit, city, province, country, postal } = await req.json();

  if (!userId || !street || !city || !province || !country || !postal) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  // Create address
  const address = await prisma.address.create({
    data: { userId, street, unit, city, province, country, postal },
  });
  // Set as default for user
  await prisma.user.update({
    where: { id: userId },
    data: { defaultAddressId: address.id },
  });
  return NextResponse.json({ address });
}
