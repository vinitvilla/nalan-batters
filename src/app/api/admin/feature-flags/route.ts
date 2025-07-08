import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const flags = await prisma.featureFlag.findMany({
    orderBy: { key: "asc" },
  });
  return NextResponse.json(flags);
}
