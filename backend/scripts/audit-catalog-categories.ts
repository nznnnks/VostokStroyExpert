import { PrismaClient } from '@prisma/client';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  HIDDEN_CATEGORY_NAME_KEYWORDS,
  HIDDEN_CATEGORY_ROOT_NAMES,
  SHOWCASE_CATEGORY_DEFINITIONS,
} from '../src/catalog/showcase-category.config';

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
};

const prisma = new PrismaClient();

function normalize(value: string) {
  return value.trim().toLowerCase();
}

async function main() {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
      },
      orderBy: { name: 'asc' },
    }),
    prisma.product.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        categoryId: true,
      },
    }),
  ]);

  const categoryMap = new Map(categories.map((item) => [item.id, item]));
  const childrenByParent = new Map<string | null, CategoryRow[]>();
  for (const category of categories) {
    const bucket = childrenByParent.get(category.parentId) ?? [];
    bucket.push(category);
    childrenByParent.set(category.parentId, bucket);
  }

  const getPath = (categoryId: string | null) => {
    const path: CategoryRow[] = [];
    let currentId = categoryId;
    while (currentId) {
      const current = categoryMap.get(currentId);
      if (!current) break;
      path.unshift(current);
      currentId = current.parentId;
    }
    return path;
  };

  const categoryProductCounts = new Map<string, number>();
  for (const product of products) {
    if (!product.categoryId) continue;
    categoryProductCounts.set(product.categoryId, (categoryProductCounts.get(product.categoryId) ?? 0) + 1);
  }

  const duplicateNames = new Map<string, CategoryRow[]>();
  for (const category of categories) {
    const key = normalize(category.name);
    const bucket = duplicateNames.get(key) ?? [];
    bucket.push(category);
    duplicateNames.set(key, bucket);
  }

  const conflicts = Array.from(duplicateNames.entries())
    .map(([, items]) => items)
    .filter((items) => items.length > 1)
    .map((items) => ({
      name: items[0].name,
      variants: items.map((item) => ({
        slug: item.slug,
        path: getPath(item.id)
          .map((node) => node.name)
          .join(' / '),
      })),
    }))
    .sort((left, right) => right.variants.length - left.variants.length || left.name.localeCompare(right.name, 'ru'));

  const hiddenRootSet = new Set(HIDDEN_CATEGORY_ROOT_NAMES.map(normalize));
  const hiddenKeywordSet = HIDDEN_CATEGORY_NAME_KEYWORDS.map(normalize);

  const hiddenCandidates = categories
    .filter((category) => {
      const path = getPath(category.id);
      const rootName = path[0]?.name ?? category.name;
      const lowerName = normalize(category.name);
      return (
        hiddenRootSet.has(normalize(rootName)) ||
        hiddenKeywordSet.some((keyword) => lowerName.includes(keyword))
      );
    })
    .map((category) => ({
      name: category.name,
      slug: category.slug,
      path: getPath(category.id)
        .map((node) => node.name)
        .join(' / '),
      products: categoryProductCounts.get(category.id) ?? 0,
    }))
    .sort((left, right) => right.products - left.products || left.path.localeCompare(right.path, 'ru'));

  const showcaseSections = SHOWCASE_CATEGORY_DEFINITIONS.map((section) => {
    const matchedCategories = categories.filter((category) => section.includeNames.includes(category.name));
    const matchedCategoryIds = new Set(matchedCategories.map((item) => item.id));
    const counts = new Map<string, number>();

    for (const product of products) {
      const path = getPath(product.categoryId);
      const matchedName = [...section.includeNames]
        .reverse()
        .find((name) => path.some((node) => node.name === name));

      if (!matchedName) continue;
      counts.set(matchedName, (counts.get(matchedName) ?? 0) + 1);
    }

    return {
      name: section.name,
      slug: section.slug,
      matchedCategoryCount: matchedCategoryIds.size,
      totalProducts: Array.from(counts.values()).reduce((sum, value) => sum + value, 0),
      subcategories: Array.from(counts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name, 'ru')),
    };
  });

  const orphanRoots = (childrenByParent.get(null) ?? [])
    .filter((category) => !SHOWCASE_CATEGORY_DEFINITIONS.some((section) => section.includeNames.includes(category.name)))
    .map((category) => ({
      name: category.name,
      slug: category.slug,
      children: (childrenByParent.get(category.id) ?? []).length,
      products: categoryProductCounts.get(category.id) ?? 0,
    }))
    .sort((left, right) => right.children - left.children || left.name.localeCompare(right.name, 'ru'));

  const reportLines = [
    '# Catalog category audit',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Summary',
    '',
    `- Total categories: ${categories.length}`,
    `- Active products: ${products.length}`,
    `- Showcase sections: ${SHOWCASE_CATEGORY_DEFINITIONS.length}`,
    `- Duplicate category names: ${conflicts.length}`,
    `- Hidden-category candidates: ${hiddenCandidates.length}`,
    '',
    '## Showcase sections',
    '',
    ...showcaseSections.flatMap((section) => [
      `### ${section.name} (${section.totalProducts})`,
      `- slug: \`${section.slug}\``,
      `- matched categories in DB: ${section.matchedCategoryCount}`,
      ...section.subcategories.slice(0, 12).map((item) => `- ${item.name}: ${item.count}`),
      '',
    ]),
    '## Duplicate names',
    '',
    ...conflicts.slice(0, 80).flatMap((conflict) => [
      `### ${conflict.name}`,
      ...conflict.variants.map((item) => `- \`${item.slug}\` -> ${item.path}`),
      '',
    ]),
    '## Categories to hide from vitrines',
    '',
    ...hiddenCandidates.slice(0, 120).map((item) => `- ${item.path} | products: ${item.products} | slug: \`${item.slug}\``),
    '',
    '## Roots outside vitrines',
    '',
    ...orphanRoots.slice(0, 80).map(
      (item) => `- ${item.name} | children: ${item.children} | direct products: ${item.products} | slug: \`${item.slug}\``,
    ),
    '',
  ];

  const reportDir = join(process.cwd(), 'reports');
  mkdirSync(reportDir, { recursive: true });
  const reportPath = join(reportDir, 'catalog-category-audit.md');
  writeFileSync(reportPath, reportLines.join('\n'), 'utf8');
  console.log(reportPath);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
