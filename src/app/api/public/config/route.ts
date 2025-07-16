import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { JsonValue } from "@prisma/client/runtime/library";

export async function GET(req: Request) {
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
  return NextResponse.json(result);
}
