import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { adminAuth } from "@/lib/firebase/firebase-admin";
import logger, { logDebug, logError, logWarn } from "@/lib/logger"

export async function GET() {
  const token = (await cookies()).get("auth-token")?.value;
  if (!token) return Response.json({ error: "No token" }, { status: 401 });

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(token);
  } catch {
    logWarn(logger, { endpoint: 'GET /api/public/me', action: 'auth_failed', reason: 'invalid_token' });
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    // Fetch user and addresses
    const user = await prisma.user.findFirst({
      where: {
        phone: decoded.phone_number,
        isDelete: false
      },
      include: {
        addresses: {
          where: { isDeleted: false },
        },
        defaultAddress: {
          where: { isDeleted: false },
        },
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

    if (!user) {
      logWarn(logger, { endpoint: 'GET /api/public/me', action: 'user_not_found', phone: decoded.phone_number });
      return Response.json({ error: "User not found" }, { status: 404 });
    }
    logDebug(logger, { endpoint: 'GET /api/public/me', action: 'user_profile_fetched', userId: user.id });
    return Response.json({ user });
  } catch (error) {
    logError(logger, error, { endpoint: 'GET /api/public/me', action: 'user_profile_fetch_failed' });
    return Response.json({ error: "Failed to fetch user profile" }, { status: 500 });
  }
}
