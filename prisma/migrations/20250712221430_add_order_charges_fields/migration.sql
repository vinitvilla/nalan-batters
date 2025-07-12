/*
  Warnings:

  - A unique constraint covering the columns `[cartId,productId]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryCharges" DECIMAL(10,2),
ADD COLUMN     "discount" DECIMAL(10,2),
ADD COLUMN     "surcharges" DECIMAL(10,2),
ADD COLUMN     "tax" DECIMAL(10,2);

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_productId_key" ON "CartItem"("cartId", "productId");
