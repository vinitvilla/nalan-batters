-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'VALUE');

-- AlterTable
ALTER TABLE "PromoCode" ADD COLUMN     "discountType" "DiscountType" NOT NULL DEFAULT 'PERCENTAGE',
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;
