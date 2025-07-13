/*
  Warnings:

  - You are about to drop the column `surcharges` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "surcharges",
ADD COLUMN     "convenienceCharges" DECIMAL(10,2);
