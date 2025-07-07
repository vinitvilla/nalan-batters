-- CreateTable
CREATE TABLE "Config" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Config_title_key" ON "Config"("title");
