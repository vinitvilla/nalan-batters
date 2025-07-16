import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE /api/public/addresses/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing address id" }, { status: 400 });
  }
  try {
    // Check if address is default for any user
    const address = await prisma.address.findUnique({ where: { id } });
    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }
    const userWithDefault = await prisma.user.findFirst({ where: { defaultAddressId: id } });
    if (userWithDefault) {
      return NextResponse.json({ error: "Cannot delete default address. Please set another address as default first." }, { status: 400 });
    }
    // Soft delete: mark isDeleted true
    await prisma.address.update({
      where: { id },
      data: { isDeleted: true },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
  }
}
