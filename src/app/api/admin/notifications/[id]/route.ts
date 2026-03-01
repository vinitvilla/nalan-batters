import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import {
  markOneAsRead,
  softDeleteOne,
} from "@/services/notification/notification.service";

async function getDbUserId(decoded: { phone_number?: string }): Promise<string | null> {
  if (!decoded.phone_number) return null;
  const user = await prisma.user.findFirst({
    where: { phone: decoded.phone_number, isDelete: false },
    select: { id: true },
  });
  return user?.id ?? null;
}

/** PATCH /api/admin/notifications/[id] — mark one notification as read */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const decoded = await requireAdmin(req);
    if (decoded instanceof NextResponse) return decoded;

    const userId = await getDbUserId(decoded);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;
    await markOneAsRead(id, userId);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/** DELETE /api/admin/notifications/[id] — soft-delete one notification */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const decoded = await requireAdmin(req);
    if (decoded instanceof NextResponse) return decoded;

    const userId = await getDbUserId(decoded);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;
    await softDeleteOne(id, userId);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
