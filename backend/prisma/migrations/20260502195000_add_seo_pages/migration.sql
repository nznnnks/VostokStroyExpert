-- CreateTable
CREATE TABLE "SeoPage" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "metaKeywords" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoPage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SeoPage_key_key" ON "SeoPage"("key");

-- CreateIndex
CREATE INDEX "SeoPage_key_idx" ON "SeoPage"("key");

