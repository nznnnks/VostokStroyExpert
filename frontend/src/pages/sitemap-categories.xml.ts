import type { APIRoute } from "astro";

import { loadCatalogCategories } from "../lib/backend-api";
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

export const prerender = false;

export const GET: APIRoute = async () => {
  const origin = getConfiguredOrigin();
  const categories = await loadCatalogCategories().catch(() => []);

  const entries: SitemapEntry[] = categories.map((category) => ({
    loc: `${origin}/catalog/category/${encodeURIComponent(category.slug)}`,
    changefreq: "weekly",
    priority: 0.7,
  }));

  return new Response(toUrlsetXml(entries), {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
    },
  });
};

