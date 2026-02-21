-- CreateEnum
CREATE TYPE "OrderSource" AS ENUM ('POS', 'ONLINE');

-- Rename enum type
ALTER TYPE "OrderType" RENAME TO "DeliveryType";

-- AlterTable
ALTER TABLE "Order" RENAME COLUMN "orderType" TO "deliveryType";

-- AlterTable  
ALTER TABLE "Order" ADD COLUMN "orderType" "OrderSource" NOT NULL DEFAULT 'ONLINE';

-- Update existing data based on orderNumber pattern
UPDATE "Order" SET "orderType" = 'POS' WHERE "orderNumber" LIKE 'P%';
UPDATE "Order" SET "orderType" = 'ONLINE' WHERE "orderNumber" NOT LIKE 'P%';