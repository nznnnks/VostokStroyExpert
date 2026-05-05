import type { APIRoute } from "astro";

import { loadCatalogListing } from "../lib/backend-api";
import { getConfiguredOrigin } from "../lib/site-url";

type SitemapEntry = {
  loc: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
};

function toUrlsetXml(entries: SitemapEntry[]) {
  const body = entries
    .map((entry) => {
      const parts = [
        `<loc>${entry.loc}</loc>`,
        entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>` : "",
        typeof entry.priority === "number" ? `<priority>${entry.priority.toFixed(1)}</priority>` : "",
      ].filter(Boolean);

      return `<url>${parts.join("")}</url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    body +
    `</urlset>`;
}

const MAX_SITEMAPS = 50;
const DEFAULT_PRODUCT_CHUNK = 10000;
const MAX_URLS_PER_SITEMAP = 50000;
const FETCH_LIMIT = 200;

function computeProductChunkSize(totalProducts: number) {
  const planned = Math.ceil(totalProducts / DEFAULT_PRODUCT_CHUNK);
  if (planned <= MAX_SITEMAPS) return DEFAULT_PRODUCT_CHUNK;
  return Math.min(MAX_URLS_PER_SITEMAP, Math.ceil(totalProducts / MAX_SITEMAPS));
}

async function loadProductSlugsChunk(index: number, chunkSize: number) {
  const startOffset = index * chunkSize;
  const startPage = Math.floor(startOffset / FETCH_LIMIT) + 1;
  const intraPageOffset = startOffset % FETCH_LIMIT;

  const slugs: string[] = [];
  let page = startPage;
  let hasMore = true;
  let offsetHandled = false;

  while (hasMore && slugs.length < chunkSize && page <= startPage + 500) {
    const listing = await loadCatalogListing({
      page,
      limit: FETCH_LIMIT,
      includeMeta: false,
      includeTotals: false,
    });

    const pageSlugs = listing.items.map((item) => item.slug).filter(Boolean);
    const sliceFrom = !offsetHandled ? intraPageOffset : 0;
    slugs.push(...pageSlugs.slice(sliceFrom));
    offsetHandled = true;

    hasMore = listing.hasMore;
    page += 1;
  }

  return slugs.slice(0, chunkSize);
}

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const origin = getConfiguredOrigin();
  const indexValue = Array.isArray(params.index) ? params.index[0] : params.index;
  const index = Number.parseInt(indexValue ?? "", 10);

  if (!Number.isFinite(index) || index < 0) {
    return new Response("Not Found", { status: 404 });
  }

  const listingTotals = await loadCatalogListing({ page: 1, limit: 1, includeMeta: false, includeTotals: true }).catch(() => ({
    items: [],
    page: 1,
    limit: 1,
    total: 0,
    totalAll: 0,
    hasMore: false,
    meta: null,
  }));

  const totalProducts = Number.isFinite(listingTotals.totalAll) ? listingTotals.totalAll : 0;
  const chunkSize = computeProductChunkSize(totalProducts);
  const totalSitemaps = Math.min(MAX_SITEMAPS, Math.max(1, Math.ceil(totalProducts / chunkSize)));

  if (index >= totalSitemaps) {
    return new Response("Not Found", { status: 404 });
  }

  const slugs = await loadProductSlugsChunk(index, chunkSize).catch(() => []);

  const entries: SitemapEntry[] = slugs.map((slug) => ({
    loc: `${origin}/catalog/${slug
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/")}`,
    changefreq: "weekly",
    priority: 0.8,
  }));

  return new Response(toUrlsetXml(entries), {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
    },
  });
};
