import { PrismaClient } from '@prisma/client';

import { resolveShowcaseCategoryMatch } from '../src/catalog/showcase-category.matcher';

async function main() {
  const prisma = new PrismaClient();

  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        parentId: true,
      },
    });

    const categoryMap = new Map(categories.map((item) => [item.id, item]));
    const products = await prisma.product.findMany({
      select: {
        id: true,
        categoryId: true,
      },
    });

    let updated = 0;

    for (const product of products) {
      const pathNames: string[] = [];
      let currentId: string | null | undefined = product.categoryId;

      while (currentId) {
        const current = categoryMap.get(currentId);
        if (!current) {
          break;
        }

        pathNames.unshift(current.name);
        currentId = current.parentId;
      }

      const showcaseCategorySlug = resolveShowcaseCategoryMatch(pathNames)?.definition.slug ?? null;

      await prisma.product.update({
        where: { id: product.id },
        data: { showcaseCategorySlug },
      });

      updated += 1;
    }

    console.log(`Backfilled showcaseCategorySlug for ${updated} products.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
