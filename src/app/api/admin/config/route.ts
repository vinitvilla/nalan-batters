import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { logError, logInfo } from "@/lib/logger"

// GET: Fetch all config entries
export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const configs = await prisma.config.findMany({
      where: { isDelete: false }
    });
    logInfo(req.logger, { action: 'configs_fetched', count: configs.length });
    return NextResponse.json(configs);
  } catch (error) {
    logError(req.logger, error, { action: 'configs_fetch_failed' });
    return NextResponse.json({ error: "Failed to fetch configs" }, { status: 500 });
  }
}

// PUT: Update a config entry by id (preferred) or title (fallback)
export async function PUT(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const { id, title, value, isActive } = await req.json();
    if (!id && !title) {
      return NextResponse.json({ error: "id or title is required" }, { status: 400 });
    }
    const where = id ? { id } : { title };
    const updated = await prisma.config.update({
      where,
      data: { value, isActive },
    });
    logInfo(req.logger, { action: 'config_updated', configId: updated.id, title: updated.title });
    return NextResponse.json(updated);
  } catch (error) {
    logError(req.logger, error, { action: 'config_update_failed' });
    return NextResponse.json({ error: "Failed to update config" }, { status: 500 });
  }
}

// DELETE: Soft delete a config entry
export async function DELETE(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const { id, title } = await req.json();
    if (!id && !title) {
      return NextResponse.json({ error: "id or title is required" }, { status: 400 });
    }
    const where = id ? { id } : { title };
    const deleted = await prisma.config.update({
      where,
      data: { isDelete: true },
    });
    logInfo(req.logger, { action: 'config_deleted', configId: deleted.id, title: deleted.title });
    return NextResponse.json(deleted);
  } catch (error) {
    logError(req.logger, error, { action: 'config_delete_failed' });
    return NextResponse.json({ error: "Failed to delete config" }, { status: 500 });
  }
}
