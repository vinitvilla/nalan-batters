import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/firebase-admin";
import { prisma } from "@/lib/prisma";
import { logDebug, logWarn } from "@/lib/logger"

export async function requireAdmin(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    logWarn(req.logger, { type: 'auth', action: 'admin_check_failed', reason: 'missing_auth_header', url: req.url });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const idToken = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(idToken);
  } catch {
    logWarn(req.logger, { type: 'auth', action: 'admin_check_failed', reason: 'invalid_token', url: req.url });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1st check: Firebase custom claim (set via scripts/set-admin.js)
  if (decoded.admin === true) {
    logDebug(req.logger, { type: 'auth', action: 'admin_verified', method: 'firebase_claim', uid: decoded.uid });
    return decoded;
  }

  // 2nd check: DB role field — ADMIN or MANAGER grants access
  const phoneNumber = decoded.phone_number;
  if (phoneNumber) {
    const user = await prisma.user.findFirst({
      where: { phone: phoneNumber, isDelete: false },
      select: { role: true },
    });

    if (user?.role === "ADMIN" || user?.role === "MANAGER") {
      logDebug(req.logger, { type: 'auth', action: 'admin_verified', method: 'db_role', role: user.role, uid: decoded.uid });
      return decoded;
    }
  }

  logWarn(req.logger, { type: 'auth', action: 'admin_check_failed', reason: 'insufficient_permissions', uid: decoded.uid });
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
