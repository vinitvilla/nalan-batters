import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import logger, { logError, logInfo } from "@/lib/logger"

export async function PUT(req: Request) {
  try {
    const { userId, role } = await req.json();
    if (!userId || !role) return NextResponse.json({ error: "Missing userId or role" }, { status: 400 });
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
    logInfo(req.logger, { endpoint: 'PUT /api/admin/users/role', action: 'user_role_updated', userId, newRole: role });
    return NextResponse.json({ user });
  } catch (error) {
    logError(req.logger, error, { endpoint: 'PUT /api/admin/users/role', action: 'user_role_update_failed' });
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}
