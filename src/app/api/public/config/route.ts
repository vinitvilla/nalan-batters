import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title");
  if (title) {
    const config = await prisma.config.findUnique({ where: { title } });
    if (!config) {
      return NextResponse.json({ error: "Config not found" }, { status: 404 });
    }
    return NextResponse.json({ [title]: config.value });
  }
  const configs = await prisma.config.findMany({ where: { isActive: true } });
  const result: Record<string, any> = {};
  configs.forEach((cfg) => {
    result[cfg.title] = cfg.value;
  });
  return NextResponse.json(result);
}
