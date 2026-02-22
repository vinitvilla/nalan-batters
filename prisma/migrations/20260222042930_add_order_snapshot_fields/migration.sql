-- AlterTable
ALTER TABLE "Order"
ADD COLUMN "subtotal" DECIMAL(10, 2) NOT NULL DEFAULT 0,
ADD COLUMN "promoCodeCode" TEXT,
ADD COLUMN "promoDiscount" DECIMAL(5, 2),
ADD COLUMN "promoDiscountType" "DiscountType",
ADD COLUMN "taxRate" DECIMAL(5, 2);