import { featuredProduct, products as fallbackProducts, type Product } from "../data/products";

type ApiCategory = {
  id: string;
  name: string;
  slug: string;
};

type ApiDiscount = {
  type: "PERCENT" | "FIXED";
  value: number;
} | null;

type ApiProduct = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  shortDescription?: string | null;
  description?: string | null;
  brand?: string | null;
  brandLabel?: string | null;
  country?: string | null;
  type?: string | null;
  price: number;
  finalPrice?: number | null;
  power?: number | null;
  volume?: number | null;
  rating?: string | null;
  efficiency?: string | null;
  efficiencyClass?: string | null;
  coverage?: string | null;
  acoustics?: string | null;
  filtration?: string | null;
  images?: string[];
  category?: ApiCategory | null;
  discount?: ApiDiscount;
};

function splitDescription(description?: string | null) {
  if (!description) {
    return undefined;
  }

  const paragraphs = description
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);

  return paragraphs.length ? paragraphs : undefined;
}

function resolveImage(product: ApiProduct) {
  return product.images?.[0] || featuredProduct.image;
}

function mapApiProduct(product: ApiProduct): Product {
  const brand = product.brand ?? "Climate";
  const power = typeof product.power === "number" ? product.power : 0;
  const volume = typeof product.volume === "number" ? product.volume : 0;
  const actualPrice = typeof product.finalPrice === "number" ? product.finalPrice : product.price;

  return {
    slug: product.slug,
    image: resolveImage(product),
    gallery: product.images?.length ? product.images : [resolveImage(product)],
    brand,
    brandLabel: product.brandLabel ?? brand.toUpperCase(),
    title: product.name,
    article: product.sku,
    category: product.category?.name ?? "Каталог",
    country: product.country ?? "Не указано",
    type: product.type ?? "Оборудование",
    power,
    volume,
    price: actualPrice,
    rating: product.rating ?? `Мощность: ${power.toFixed(1)} кВт`,
    efficiency: product.efficiency ?? "Энергоэффективность уточняется",
    efficiencyClass: product.efficiencyClass ?? undefined,
    coverage: product.coverage ?? undefined,
    acoustics: product.acoustics ?? undefined,
    filtration: product.filtration ?? undefined,
    description: splitDescription(product.description),
  };
}

export async function loadCatalogProducts(): Promise<Product[]> {
  const apiBaseUrl = import.meta.env.PUBLIC_API_BASE_URL ?? "http://localhost:3000";

  try {
    const response = await fetch(`${apiBaseUrl}/api/products`, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Catalog API returned ${response.status}`);
    }

    const data = (await response.json()) as ApiProduct[];

    if (!Array.isArray(data) || data.length === 0) {
      return [...fallbackProducts, featuredProduct];
    }

    return data.map(mapApiProduct);
  } catch (error) {
    console.warn("Catalog API is unavailable, fallback mock data is used.", error);
    return [...fallbackProducts, featuredProduct];
  }
}
