import {
  HIDDEN_CATEGORY_NAME_KEYWORDS,
  HIDDEN_CATEGORY_ROOT_NAMES,
  SHOWCASE_CATEGORY_DEFINITIONS,
  type ShowcaseCategoryDefinition,
} from './showcase-category.config';

const hiddenCategoryRootNameSet = new Set(HIDDEN_CATEGORY_ROOT_NAMES.map((item) => item.trim().toLowerCase()));
const hiddenCategoryKeywordSet = HIDDEN_CATEGORY_NAME_KEYWORDS.map((item) => item.trim().toLowerCase());

export type ShowcaseCategoryMatch = {
  definition: ShowcaseCategoryDefinition;
  matchedType: string;
};

export function findShowcaseCategoryDefinition(value: string | undefined | null) {
  const normalized = value?.trim();
  if (!normalized) {
    return undefined;
  }

  return SHOWCASE_CATEGORY_DEFINITIONS.find((item) => item.slug === normalized || item.name === normalized);
}

export function resolveShowcaseCategoryMatch(categoryPathNames: string[]): ShowcaseCategoryMatch | null {
  const directMatch = resolveDirectShowcaseCategoryMatch(categoryPathNames);
  if (directMatch) {
    return directMatch;
  }

  return resolveFallbackShowcaseCategoryMatch(categoryPathNames);
}

export function resolveShowcaseMatchedType(
  categoryPathNames: string[],
  definition: ShowcaseCategoryDefinition,
): string | null {
  let bestMatch: { matchedType: string; depth: number } | null = null;

  for (const includeName of definition.includeNames) {
    const depth = categoryPathNames.lastIndexOf(includeName);
    if (depth === -1) {
      continue;
    }

    if (!bestMatch || depth > bestMatch.depth) {
      bestMatch = { matchedType: includeName, depth };
    }
  }

  if (bestMatch) {
    return bestMatch.matchedType;
  }

  const deepestVisible = resolveDeepestVisibleCategoryName(categoryPathNames);
  return deepestVisible ?? categoryPathNames[categoryPathNames.length - 1] ?? null;
}

function resolveDirectShowcaseCategoryMatch(categoryPathNames: string[]): ShowcaseCategoryMatch | null {
  let bestMatch:
    | {
        definition: ShowcaseCategoryDefinition;
        matchedType: string;
        depth: number;
      }
    | null = null;

  for (const definition of SHOWCASE_CATEGORY_DEFINITIONS) {
    for (const includeName of definition.includeNames) {
      const depth = categoryPathNames.lastIndexOf(includeName);
      if (depth === -1) {
        continue;
      }

      if (!bestMatch || depth > bestMatch.depth) {
        bestMatch = {
          definition,
          matchedType: includeName,
          depth,
        };
      }
    }
  }

  return bestMatch
    ? {
        definition: bestMatch.definition,
        matchedType: bestMatch.matchedType,
      }
    : null;
}

function resolveFallbackShowcaseCategoryMatch(categoryPathNames: string[]): ShowcaseCategoryMatch | null {
  if (categoryPathNames.length === 0) {
    return null;
  }

  const normalizedNames = categoryPathNames.map((item) => item.trim().toLowerCase());
  const deepestVisibleName =
    [...categoryPathNames].reverse().find((item) => !isHiddenCategoryName(item, { allowRoot: true })) ??
    categoryPathNames[categoryPathNames.length - 1];

  for (const definition of SHOWCASE_CATEGORY_DEFINITIONS) {
    const includeNames = (definition.fallbackIncludeNames ?? []).map((item) => item.trim().toLowerCase());
    const rootNames = (definition.fallbackRootNames ?? []).map((item) => item.trim().toLowerCase());

    if (
      !includeNames.some((item) => normalizedNames.includes(item)) &&
      !rootNames.some((item) => normalizedNames[0] === item)
    ) {
      continue;
    }

    return {
      definition,
      matchedType: deepestVisibleName,
    };
  }

  return null;
}

function resolveDeepestVisibleCategoryName(categoryPathNames: string[]) {
  return [...categoryPathNames].reverse().find((item) => !isHiddenCategoryName(item, { allowRoot: true })) ?? null;
}

function isHiddenCategoryName(name: string, { allowRoot = false }: { allowRoot?: boolean } = {}) {
  const normalized = name.trim().toLowerCase();
  if (!allowRoot && hiddenCategoryRootNameSet.has(normalized)) {
    return true;
  }

  return hiddenCategoryKeywordSet.some((keyword) => normalized.includes(keyword));
}
