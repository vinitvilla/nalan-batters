// src/lib/prisma.ts
import { PrismaClient } from "@/generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";

// Prevent multiple instances of Prisma Client in development
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalForPrisma = globalThis as unknown as { prisma: any | undefined };

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development"
      ? ["query", "info", "warn", "error"]
      : ["warn", "error"],
  }).$extends(withAccelerate());
}

// Cast to PrismaClient so TypeScript preserves full type inference on all
// queries (select, include, groupBy, aggregate etc.). The actual runtime
// instance is the accelerate-extended client, so Prisma Accelerate is still
// used for connection pooling — TypeScript just sees the base type.
export const prisma = (
  globalForPrisma.prisma ?? createPrismaClient()
) as unknown as PrismaClient;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
