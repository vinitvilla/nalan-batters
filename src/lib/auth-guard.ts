import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/firebase-admin";
import { logDebug, logWarn } from "@/lib/logger"

export async function requireAuth(req: NextRequest) {
  // Check Authorization header
  const authHeader = req.headers.get("authorization");
  let token: string | undefined;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else {
    // Fallback to cookie
    const cookieToken = req.cookies.get("auth-token");
    if (cookieToken) token = cookieToken.value;
  }

  if (!token) {
    logWarn(req.logger, { type: 'auth', action: 'auth_failed', reason: 'no_token', url: req.url });
    return NextResponse.json({ error: "Unauthorized: No token provided" }, { status: 401 });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    logDebug(req.logger, { type: 'auth', action: 'auth_verified', uid: decoded.uid });
    return decoded;
  } catch (error) {
    logWarn(req.logger, { type: 'auth', action: 'auth_failed', reason: 'invalid_token', error: error instanceof Error ? error.message : 'Unknown error', url: req.url });
    return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
  }
}
