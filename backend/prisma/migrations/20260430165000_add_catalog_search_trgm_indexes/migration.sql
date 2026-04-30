CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX "Product_name_trgm_idx" ON "Product" USING gin (name gin_trgm_ops);
CREATE INDEX "Product_slug_trgm_idx" ON "Product" USING gin (slug gin_trgm_ops);
CREATE INDEX "Product_sku_trgm_idx" ON "Product" USING gin (sku gin_trgm_ops);
CREATE INDEX "Product_brand_trgm_idx" ON "Product" USING gin (brand gin_trgm_ops);
