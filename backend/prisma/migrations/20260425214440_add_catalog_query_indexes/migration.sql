-- CreateIndex
CREATE INDEX "Product_status_createdAt_idx" ON "Product"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Product_status_price_idx" ON "Product"("status", "price");

-- CreateIndex
CREATE INDEX "Product_categoryId_status_createdAt_idx" ON "Product"("categoryId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Product_brand_status_idx" ON "Product"("brand", "status");

-- CreateIndex
CREATE INDEX "Product_country_status_idx" ON "Product"("country", "status");

-- CreateIndex
CREATE INDEX "Product_type_status_idx" ON "Product"("type", "status");

-- CreateIndex
CREATE INDEX "ProductFilterValue_parameterId_value_idx" ON "ProductFilterValue"("parameterId", "value");

-- CreateIndex
CREATE INDEX "ProductFilterValue_parameterId_numericValue_idx" ON "ProductFilterValue"("parameterId", "numericValue");

-- CreateIndex
CREATE INDEX "ProductFilterValue_productId_parameterId_numericValue_idx" ON "ProductFilterValue"("productId", "parameterId", "numericValue");
