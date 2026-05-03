const STORAGE_KEY = "climatrade:catalogCategoryImages:v1";

// Images for catalog category tiles are served from `/public/catalog/categories/*`.
// We keep an explicit map so the UI is stable and does not depend on backend-provided URLs.
const CATEGORY_IMAGE_FILES: Record<string, string> = {
  "бытовая-приточная-вентиляция": "Бытовая-приточная-вентиляция.jpg",
  "вытяжные-бытовые-вентиляторы": "Вентилятор вытяжной.jpg",
  "водонагреватели": "водонагреватель.jpg",
  "газовые-обогреватели": "Газовые обогреватели.jpg",
  "дизайн-радиаторы": "Дизайн-радиаторы.jpg",
  "камины": "Камины.jpg",
  "конвекторы": "Конвектор.jpg",
  "мобильные-кондиционеры": "Мобильные-кондиционеры.jpg",
  "осушители-воздуха": "Осушители-воздуха.jpg",
  "промышленные-вентиляторы": "Промышленные вентиляторы.jpg",
  "радиаторы-отопления": "Радиаторы отопления.jpg",
  "сплит-системы": "Сплит-системы.png",
  "сушилки-для-рук": "Сушилки для рук.jpg",
  "тепловые-пушки": "Тепловая пушка.jpg",
  "тепловентиляторы": "Тепловентиляторы.jpg",
  "теплые-полы-электрические": "теплого пола.jpg",
  "увлажнители-и-очистители-воздуха": "Увлажнитель воздуха.jpg",
  "умный-дом": "умный дом.jpg",
};

function normalizeCategoryImageKey(input: string) {
  return (input || "")
    .trim()
    .toLowerCase()
    .replace(/[._]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

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

export function getStableCategoryImage(categorySlug: string, candidateImage?: string | null, categoryName?: string) {
  // Client-side only helper (CatalogPage is mounted via client:load).
  const slug = categorySlug || "category";
  const cache = safeReadCache();
  const existing = cache[slug];
  if (existing) return existing;

  const key = normalizeCategoryImageKey(categoryName || slug);
  const mappedFile = CATEGORY_IMAGE_FILES[key];
  const nextImage = mappedFile ? `/catalog/categories/${mappedFile}` : candidateImage || getCategoryFallbackImage(slug);
  cache[slug] = nextImage;
  safeWriteCache(cache);
  return nextImage;
}

