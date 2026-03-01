import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import logger, { logError, logInfo } from "@/lib/logger"

// GET: List all users (for admin)
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { isDelete: false },
      orderBy: { createdAt: "desc" },
    });
    logInfo(req.logger, { endpoint: 'GET /api/admin/users', action: 'users_fetched', count: users.length });
    return NextResponse.json(users);
  } catch (error) {
    logError(req.logger, error, { endpoint: 'GET /api/admin/users', action: 'users_fetch_failed' });
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// PUT: Update user name (no isActive field in schema)
export async function PUT(req: NextRequest) {
  try {
    const { id, fullName } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    const data: Record<string, unknown> = {};
    if (typeof fullName === "string") data.fullName = fullName;
    const user = await prisma.user.update({
      where: { id },
      data,
    });
    logInfo(req.logger, { endpoint: 'PUT /api/admin/users', action: 'user_updated', userId: id });
    return NextResponse.json(user);
  } catch (error) {
    logError(req.logger, error, { endpoint: 'PUT /api/admin/users', action: 'user_update_failed' });
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// DELETE: Soft delete user
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    const user = await prisma.user.update({
      where: { id },
      data: { isDelete: true },
    });
    logInfo(req.logger, { endpoint: 'DELETE /api/admin/users', action: 'user_deleted', userId: id });
    return NextResponse.json(user);
  } catch (error) {
    logError(req.logger, error, { endpoint: 'DELETE /api/admin/users', action: 'user_delete_failed' });
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
