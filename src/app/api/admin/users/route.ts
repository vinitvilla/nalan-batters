import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: List all users (for admin)
export async function GET(req: NextRequest) {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(users);
}

// PUT: Update user name (no isActive field in schema)
export async function PUT(req: NextRequest) {
  const { id, fullName } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  const data: any = {};
  if (typeof fullName === "string") data.fullName = fullName;
  const user = await prisma.user.update({
    where: { id },
    data,
  });
  return NextResponse.json(user);
}
