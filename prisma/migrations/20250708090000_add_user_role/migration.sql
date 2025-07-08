-- AlterTable
ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'USER';

-- CreateEnum
-- Note: Prisma will handle enum creation in the generated migration if not present.
