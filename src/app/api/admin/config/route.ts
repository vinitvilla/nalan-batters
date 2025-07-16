import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

// GET: Fetch all config entries
export async function GET(req: NextRequest) {
  await requireAdmin(req);
  const configs = await prisma.config.findMany({
    where: { isDelete: false }
  });
  return NextResponse.json(configs);
}

// PUT: Update a config entry by id (preferred) or title (fallback)
export async function PUT(req: NextRequest) {
  await requireAdmin(req);
  const { id, title, value, isActive } = await req.json();
  if (!id && !title) {
    return NextResponse.json({ error: "id or title is required" }, { status: 400 });
  }
  const where = id ? { id } : { title };
  const updated = await prisma.config.update({
    where,
    data: { value, isActive },
  });
  return NextResponse.json(updated);
}

// DELETE: Soft delete a config entry
export async function DELETE(req: NextRequest) {
  await requireAdmin(req);
  const { id, title } = await req.json();
  if (!id && !title) {
    return NextResponse.json({ error: "id or title is required" }, { status: 400 });
  }
  const where = id ? { id } : { title };
  const deleted = await prisma.config.update({
    where,
    data: { isDelete: true },
  });
  return NextResponse.json(deleted);
}
