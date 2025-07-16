-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "isDelete" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Config" ADD COLUMN     "isDelete" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "isDelete" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isDelete" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isDelete" BOOLEAN NOT NULL DEFAULT false;
