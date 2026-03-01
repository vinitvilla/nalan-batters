import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import {
  getNotifications,
  markAllAsRead,
} from "@/services/notification/notification.service";
import { logError, logInfo, logWarn } from "@/lib/logger"

/** Resolve the DB user id from the Firebase decoded token. */
async function getDbUserId(decoded: { phone_number?: string }): Promise<string | null> {
  if (!decoded.phone_number) return null;
  const user = await prisma.user.findFirst({
    where: { phone: decoded.phone_number, isDelete: false },
    select: { id: true },
  });
  return user?.id ?? null;
}

/** GET /api/admin/notifications — paginated list + unread count */
export async function GET(req: NextRequest) {
  try {
    const decoded = await requireAdmin(req);
    if (decoded instanceof NextResponse) return decoded;

    const userId = await getDbUserId(decoded);
    if (!userId) {
      logWarn(req.logger, { action: 'user_not_found', phone: decoded.phone_number });
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const result = await getNotifications(userId, page, limit);
    logInfo(req.logger, { action: 'notifications_fetched', userId, page, limit });
    return NextResponse.json(result);
  } catch (err: unknown) {
    logError(req.logger, err, { action: 'notifications_fetch_failed' });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/** PATCH /api/admin/notifications — mark all as read */
export async function PATCH(req: NextRequest) {
  try {
    const decoded = await requireAdmin(req);
    if (decoded instanceof NextResponse) return decoded;

    const userId = await getDbUserId(decoded);
    if (!userId) {
      logWarn(req.logger, { action: 'user_not_found', phone: decoded.phone_number });
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await markAllAsRead(userId);
    logInfo(req.logger, { action: 'all_notifications_marked_read', userId });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    logError(req.logger, err, { action: 'mark_all_read_failed' });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
