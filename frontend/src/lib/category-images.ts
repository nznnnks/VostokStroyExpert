const STORAGE_KEY = "climatrade:catalogCategoryImages:v1";

// Images for catalog category tiles are served from `/public/catalog/categories/*`.
// We keep an explicit map so the UI is stable and does not depend on backend-provided URLs.
const CATEGORY_IMAGE_FILES: Record<string, string> = {
  "бытовая-приточная-вентиляция": "bytovaya-pritochnaya-ventilyatsiya.jpg",
  "вытяжные-бытовые-вентиляторы": "vytyazhnye-bytovye-ventilyatory.jpg",
  "водонагреватели": "vodonagrevateli.jpg",
  "газовые-обогреватели": "gazovye-obogrevateli.jpg",
  "дизайн-радиаторы": "dizayn-radiatory.jpg",
  "камины": "kaminy.jpg",
  "конвекторы": "konvektory.jpg",
  "мобильные-кондиционеры": "mobilnye-konditsionery.jpg",
  "осушители-воздуха": "osushiteli-vozdukha.jpg",
  "промышленные-вентиляторы": "promyshlennye-ventilyatory.jpg",
  "радиаторы-отопления": "radiatory-otopleniya.jpg",
  "сплит-системы": "split-sistemy.png",
  "сушилки-для-рук": "sushilki-dlya-ruk.jpg",
  "тепловые-пушки": "teplovye-pushki.jpg",
  "тепловентиляторы": "teploventilyatory.jpg",
  "теплые-полы-электрические": "teplye-poly-elektricheskie.jpg",
  "увлажнители-и-очистители-воздуха": "uvlazhniteli-i-ochistiteli-vozdukha.jpg",
  "умный-дом": "umnyy-dom.jpg",
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

