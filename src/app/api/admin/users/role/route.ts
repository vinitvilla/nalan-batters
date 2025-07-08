import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  const { userId, role } = await req.json();
  if (!userId || !role) return NextResponse.json({ error: "Missing userId or role" }, { status: 400 });
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
    return NextResponse.json({ user });
  } catch (e) {
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}
