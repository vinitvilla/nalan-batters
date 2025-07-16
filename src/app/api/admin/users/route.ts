import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: List all users (for admin)
export async function GET() {
  const users = await prisma.user.findMany({
    where: { isDelete: false },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(users);
}

// PUT: Update user name (no isActive field in schema)
export async function PUT(req: NextRequest) {
  const { id, fullName } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  const data: Record<string, unknown> = {};
  if (typeof fullName === "string") data.fullName = fullName;
  const user = await prisma.user.update({
    where: { id },
    data,
  });
  return NextResponse.json(user);
}

// DELETE: Soft delete user
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  const user = await prisma.user.update({
    where: { id },
    data: { isDelete: true },
  });
  return NextResponse.json(user);
}
