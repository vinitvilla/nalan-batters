import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/firebase-admin";
import { prisma } from "@/lib/prisma";

export async function requireAdmin(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const idToken = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(idToken);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1st check: Firebase custom claim (set via scripts/set-admin.js)
  if (decoded.admin === true) {
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
      return decoded;
    }
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
