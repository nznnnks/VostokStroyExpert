import type { APIRoute } from "astro";

import { loadCatalogListing } from "../lib/backend-api";
import { getConfiguredOrigin } from "../lib/site-url";

type SitemapIndexEntry = { loc: string; lastmod?: string };

function toSitemapIndexXml(entries: SitemapIndexEntry[]) {
  const body = entries
    .map((entry) => {
      const parts = [`<loc>${entry.loc}</loc>`, entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ""].filter(Boolean);
      return `<sitemap>${parts.join("")}</sitemap>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    body +
    `</sitemapindex>`;
}

const MAX_SITEMAPS = 50;
const DEFAULT_PRODUCT_CHUNK = 10000;
const MAX_URLS_PER_SITEMAP = 50000;

function computeProductChunkSize(totalProducts: number) {
  const planned = Math.ceil(totalProducts / DEFAULT_PRODUCT_CHUNK);
  if (planned <= MAX_SITEMAPS) return DEFAULT_PRODUCT_CHUNK;
  return Math.min(MAX_URLS_PER_SITEMAP, Math.ceil(totalProducts / MAX_SITEMAPS));
}

export const prerender = false;

export const GET: APIRoute = async () => {
  const origin = getConfiguredOrigin();

  const listing = await loadCatalogListing({ page: 1, limit: 1, includeMeta: false, includeTotals: true }).catch(() => ({
    items: [],
    page: 1,
    limit: 1,
    total: 0,
    totalAll: 0,
    hasMore: false,
    meta: null,
  }));

  const totalProducts = Number.isFinite(listing.totalAll) ? listing.totalAll : 0;
  const productChunkSize = computeProductChunkSize(totalProducts);
  const productSitemaps = Math.min(MAX_SITEMAPS, Math.max(1, Math.ceil(totalProducts / productChunkSize)));

  const entries: SitemapIndexEntry[] = [
    { loc: `${origin}/sitemap-static.xml` },
    { loc: `${origin}/sitemap-categories.xml` },
    { loc: `${origin}/sitemap-services.xml` },
    { loc: `${origin}/sitemap-news.xml` },
  ];

  for (let i = 0; i < productSitemaps; i += 1) {
    entries.push({
      loc: `${origin}/sitemap-products-${i}.xml`,
    });
  }

  return new Response(toSitemapIndexXml(entries), {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
    },
  });
};
