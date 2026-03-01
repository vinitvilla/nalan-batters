import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { JsonValue } from "@prisma/client/runtime/library";
import { logDebug, logError } from "@/lib/logger"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title");
    if (title) {
      const config = await prisma.config.findFirst({
        where: {
          title,
          isDelete: false
        }
      });
      if (!config) {
        return NextResponse.json({ error: "Config not found" }, { status: 404 });
      }
      logDebug(req.logger, { endpoint: 'GET /api/public/config', action: 'config_fetched', title });
      return NextResponse.json({ [title]: config.value });
    }
    const configs = await prisma.config.findMany({
      where: {
        isActive: true,
        isDelete: false
      }
    });
    const result: Record<string, JsonValue> = {};
    configs.forEach((cfg) => {
      result[cfg.title] = cfg.value;
    });
    logDebug(req.logger, { endpoint: 'GET /api/public/config', action: 'all_configs_fetched', count: configs.length });
    return NextResponse.json(result);
  } catch (error) {
    logError(req.logger, error, { endpoint: 'GET /api/public/config', action: 'config_fetch_failed' });
    return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
  }
}
