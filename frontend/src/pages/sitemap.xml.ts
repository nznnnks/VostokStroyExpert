import type { APIRoute } from "astro";

import { loadCatalogCategories, loadCatalogListing, loadNewsPosts, loadServices } from "../lib/backend-api";

type SitemapEntry = {
  loc: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
};

function toXml(entries: SitemapEntry[]) {
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

async function loadAllProductSlugs() {
  const slugs = new Set<string>();
  let page = 1;
  let hasMore = true;

  while (hasMore && page <= 200) {
    const listing = await loadCatalogListing({ page, limit: 200, includeMeta: false, includeTotals: false });
    for (const item of listing.items) slugs.add(item.slug);
    hasMore = listing.hasMore;
    page += 1;
  }

  return Array.from(slugs);
}

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const origin = url.origin;

  const [categories, services, news, productSlugs] = await Promise.all([
    loadCatalogCategories().catch(() => []),
    loadServices().catch(() => []),
    loadNewsPosts().catch(() => []),
    loadAllProductSlugs().catch(() => []),
  ]);

  const entries: SitemapEntry[] = [
    { loc: `${origin}/`, changefreq: "weekly", priority: 1.0 },
    { loc: `${origin}/about`, changefreq: "monthly", priority: 0.6 },
    { loc: `${origin}/catalog`, changefreq: "daily", priority: 0.9 },
    { loc: `${origin}/services`, changefreq: "weekly", priority: 0.8 },
    { loc: `${origin}/news`, changefreq: "weekly", priority: 0.7 },
  ];

  for (const category of categories) {
    entries.push({
      loc: `${origin}/catalog/category/${encodeURIComponent(category.slug)}`,
      changefreq: "weekly",
      priority: 0.7,
    });
  }

  for (const service of services) {
    entries.push({
      loc: `${origin}/services/${encodeURIComponent(service.slug)}`,
      changefreq: "monthly",
      priority: 0.6,
    });
  }

  for (const post of news) {
    entries.push({
      loc: `${origin}/news/${encodeURIComponent(post.slug)}`,
      changefreq: "weekly",
      priority: 0.6,
    });
  }

  for (const slug of productSlugs) {
    entries.push({
      loc: `${origin}/catalog/${encodeURIComponent(slug)}`,
      changefreq: "weekly",
      priority: 0.8,
    });
  }

  return new Response(toXml(entries), {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
    },
  });
};

