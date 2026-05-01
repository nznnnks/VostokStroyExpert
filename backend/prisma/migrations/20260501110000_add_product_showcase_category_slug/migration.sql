ALTER TABLE "Product"
ADD COLUMN "showcaseCategorySlug" TEXT;

CREATE INDEX "Product_showcaseCategorySlug_status_idx"
ON "Product"("showcaseCategorySlug", "status");
