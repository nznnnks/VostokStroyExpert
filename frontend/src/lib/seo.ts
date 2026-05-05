export function normalizeSeoText(value: string) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export function buildKeywordsFromTitleAndDescription(title?: string | null, description?: string | null) {
  const normalizedTitle = normalizeSeoText(title ?? "");
  const normalizedDescription = normalizeSeoText(description ?? "");
  const parts = [normalizedTitle, normalizedDescription].filter(Boolean);
  return Array.from(new Set(parts)).join(", ");
}

export function truncateSeoDescription(value: string, maxLength = 170) {
  const normalized = normalizeSeoText(value);
  const minLength = 120;

  const padded =
    normalized.length >= minLength
      ? normalized
      : `${normalized}${normalized ? " " : ""}Уточняйте цены, характеристики и условия доставки на сайте.`;

  if (padded.length <= maxLength) return padded;
  return `${padded.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}
