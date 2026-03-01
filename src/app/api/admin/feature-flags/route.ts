import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logError, logInfo, logger } from "@/lib/logger";

export async function GET() {
  try {
    const flags = await prisma.featureFlag.findMany({
      orderBy: { key: "asc" },
    });
    logInfo(logger, { endpoint: 'GET /api/admin/feature-flags', action: 'feature_flags_fetched', count: flags.length });
    return NextResponse.json(flags);
  } catch (error) {
    logError(logger, error, { endpoint: 'GET /api/admin/feature-flags', action: 'feature_flags_fetch_failed' });
    return NextResponse.json({ error: "Failed to fetch feature flags" }, { status: 500 });
  }
}
