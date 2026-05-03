import { useMemo } from "react";

import type { Product } from "../data/products";
import { slugify } from "../lib/slug";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

type CatalogCategoriesPageProps = {
  products: Product[];
};

type CategoryCard = {
  name: string;
  slug: string;
  count: number;
  image: string;
};

export function CatalogCategoriesPage({ products }: CatalogCategoriesPageProps) {
  const categories = useMemo<CategoryCard[]>(() => {
    const map = new Map<string, { count: number; image: string }>();

    for (const product of products) {
      const prev = map.get(product.category);
      if (!prev) {
        map.set(product.category, { count: 1, image: product.image });
      } else {
        const candidate = product.image || "";
        const nextImage =
          prev.image && candidate ? (candidate.localeCompare(prev.image) < 0 ? candidate : prev.image) : prev.image || candidate;
        map.set(product.category, {
          count: prev.count + 1,
          // Pick a deterministic image so it doesn't change between reloads when product ordering changes.
          image: nextImage,
        });
      }
    }

    return Array.from(map.entries())
      .map(([name, meta]) => ({
        name,
        slug: slugify(name),
        count: meta.count,
        image: meta.image,
      }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ru"));
  }, [products]);

  return (
    <div className="min-h-screen bg-[#f6f3ee] text-[#2b2a27]">
      <SiteHeader fullBleed />

      <main className="mx-auto w-full max-w-[1700px] px-5 pb-14 pt-8 md:px-8 md:pt-10">
        <div>
          <h1 className="text-[42px] leading-[1.05] md:text-[56px] [font-family:'Cormorant_Garamond',serif]">Каталог</h1>
          <p className="mt-4 max-w-[760px] text-[18px] leading-8 text-[#7a7a75]">Выберите категорию.</p>
        </div>

        <section className="mt-10">
          {categories.length ? (
            <div
              className="mt-8 grid grid-cols-1 gap-4 auto-rows-[minmax(240px,320px)] sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4"
              style={{ gridAutoFlow: "dense" }}
            >
              {categories.map((category, index) => (
                <a
                  key={category.slug}
                  href={`/catalog/category/${category.slug}`}
                  className={[
                    "group flex min-h-0 flex-col overflow-hidden rounded-[18px] border border-[#e7e1d9] bg-white",
                    "transition-shadow hover:shadow-[0_18px_40px_rgba(38,35,31,0.10)]",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2b2a27]/40",
                    getCategorySizeClass(index),
                  ].join(" ")}
                >
                  <div className="flex min-h-0 flex-1 flex-col">
                    <div className="flex min-h-0 flex-1 items-center justify-center bg-[#f7f7f9] p-4 md:p-6">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          loading="lazy"
                          className="max-h-full w-auto max-w-[92%] object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="h-full w-full rounded-[14px] bg-[#f0efec]" aria-hidden />
                      )}
                    </div>

                    <div className="bg-white px-5 py-5 md:px-6">
                      <h2 className="text-[16px] font-medium leading-[1.25] md:text-[18px] [font-family:Manrope,system-ui]">
                        {category.name}
                      </h2>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-[18px] border border-[#e7e1d9] bg-white px-6 py-8 text-[#7a7a75]">
              Категории не найдены.
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function getCategorySizeClass(index: number) {
  const pattern = index % 12;

  if (pattern === 0 || pattern === 7) return "md:row-span-2";
  if (pattern === 3 || pattern === 9) return "lg:col-span-2";
  if (pattern === 5) return "lg:col-span-2 md:row-span-2";
  return "";
}

export default CatalogCategoriesPage;
