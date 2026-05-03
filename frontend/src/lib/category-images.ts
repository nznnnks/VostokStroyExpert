const STORAGE_KEY = "climatrade:catalogCategoryImages:v1";

function hashString(input: string) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function getCategoryFallbackImage(categorySlug: string) {
  const variants = [
    "/catalog/product-1.png",
    "/catalog/product-2.png",
    "/catalog/product-3.png",
    "/catalog/product-4.png",
    "/catalog/product-5.png",
    "/catalog/product-6.png",
  ] as const;

  const idx = hashString(categorySlug || "category") % variants.length;
  return variants[idx];
}

function safeReadCache(): Record<string, string> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, string>;
  } catch {
    return {};
  }
}

function safeWriteCache(next: Record<string, string>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function getStableCategoryImage(categorySlug: string, candidateImage?: string | null) {
  // Client-side only helper (CatalogPage is mounted via client:load).
  const slug = categorySlug || "category";
  const cache = safeReadCache();
  const existing = cache[slug];
  if (existing) return existing;

  const nextImage = candidateImage || getCategoryFallbackImage(slug);
  cache[slug] = nextImage;
  safeWriteCache(cache);
  return nextImage;
}

