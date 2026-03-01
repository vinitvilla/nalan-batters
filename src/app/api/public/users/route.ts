import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { logDebug, logError, logInfo, logWarn } from "@/lib/logger"

export async function GET(req: NextRequest) {
    const authUser = await requireAuth(req);
    if (authUser instanceof NextResponse) return authUser;

    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    if (!phone) return NextResponse.json({ error: "Missing phone" }, { status: 400 });

    // Only allow users to look up their own data (or admins)
    if (authUser.phone_number !== phone && !authUser.admin) {
      logWarn(req.logger, { action: 'idor_blocked', phone, authenticatedPhone: authUser.phone_number });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
      const user = await prisma.user.findFirst({
        where: {
          phone,
          isDelete: false
        },
        include: {
          addresses: {
            where: { isDeleted: false },
          },
          defaultAddress: true,
          cart: {
            include: {
              items: {
                include: {
                  product: true,
                },
                where: {
                  product: { isDelete: false }
                }
              },
            },
          },
        },
      });
      logDebug(req.logger, { action: 'user_fetched', found: !!user });
      return NextResponse.json({ user });
    } catch (error) {
      logError(req.logger, error, { action: 'user_fetch_failed' });
      return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const authUser = await requireAuth(req);
    if (authUser instanceof NextResponse) return authUser;

    try {
      const { id: uid, phone, fullName } = await req.json();
      if (!uid || !phone || !fullName) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

      // Ensure the authenticated user matches the phone being registered
      if (authUser.phone_number !== phone && !authUser.admin) {
        logWarn(req.logger, { action: 'idor_blocked', phone, authenticatedPhone: authUser.phone_number });
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      let user = await prisma.user.findFirst({
        where: {
          phone,
          isDelete: false
        }
      });
      if (!user) {
        user = await prisma.user.create({ data: { phone, fullName, id: uid } });
        logInfo(req.logger, { action: 'user_registered', userId: uid, phone });
      } else {
        logDebug(req.logger, { action: 'user_already_exists', userId: user.id });
      }
      return NextResponse.json({ user });
    } catch (error) {
      logError(req.logger, error, { action: 'user_register_failed' });
      return NextResponse.json({ error: "Failed to register user" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const authUser = await requireAuth(req);
    if (authUser instanceof NextResponse) return authUser;

    try {
      const { phone, fullName } = await req.json();
      if (!phone || !fullName) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

      // Only allow users to update their own data (or admins)
      if (authUser.phone_number !== phone && !authUser.admin) {
        logWarn(req.logger, { action: 'idor_blocked', phone, authenticatedPhone: authUser.phone_number });
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const user = await prisma.user.update({
          where: { phone },
          data: { fullName },
      });
      logInfo(req.logger, { action: 'user_updated', userId: user.id, phone });
      return NextResponse.json({ user });
    } catch (error) {
      logError(req.logger, error, { action: 'user_update_failed' });
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}
