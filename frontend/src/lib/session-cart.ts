import type { Product } from "../data/products";
import { loadCatalogProductBySlug, resolveProductIdsBySlugs, type CartView } from "./backend-api";

type StoredCartItem = {
  slug: string;
  quantity: number;
};

const CART_COOKIE_KEY = "vostokstroyexpert-cart";
export const SESSION_CART_UPDATED_EVENT = "session-cart-updated";

function isBrowser() {
  return typeof document !== "undefined";
}

function readCookie(name: string) {
  if (!isBrowser()) {
    return null;
  }

  const cookies = document.cookie ? document.cookie.split("; ") : [];

  for (const cookie of cookies) {
    const [key, ...rest] = cookie.split("=");

    if (key === name) {
      return decodeURIComponent(rest.join("="));
    }
  }

  return null;
}

function writeCookie(name: string, value: string) {
  if (!isBrowser()) {
    return;
  }

  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax`;
}

function clearCookie(name: string) {
  if (!isBrowser()) {
    return;
  }

  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

function normalizeItems(items: StoredCartItem[]) {
  const merged = new Map<string, { quantity: number }>();

  for (const item of items) {
    const slug = item.slug?.trim();
    const quantity = Math.max(0, Math.floor(item.quantity));

    if (!slug || quantity <= 0) {
      continue;
    }

    const current = merged.get(slug);
    merged.set(slug, {
      quantity: (current?.quantity ?? 0) + quantity,
    });
  }

  return Array.from(merged.entries()).map(([slug, value]) => ({ slug, quantity: value.quantity }));
}

function readStoredCartItems() {
  const raw = readCookie(CART_COOKIE_KEY);

  if (!raw) {
    return [];
  }

  try {
    return normalizeItems(JSON.parse(raw) as StoredCartItem[]);
  } catch {
    clearCookie(CART_COOKIE_KEY);
    return [];
  }
}

function writeStoredCartItems(items: StoredCartItem[]) {
  const normalized = normalizeItems(items);

  if (normalized.length === 0) {
    clearCookie(CART_COOKIE_KEY);
    notifySessionCartUpdated();
    return;
  }

  // Keep storage minimal to avoid the 4KB cookie limit (cart quantity could "cap" around ~6 items otherwise).
  writeCookie(
    CART_COOKIE_KEY,
    JSON.stringify(normalized.map((item) => ({ slug: item.slug, quantity: item.quantity }))),
  );
  notifySessionCartUpdated();
}

function notifySessionCartUpdated() {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new CustomEvent(SESSION_CART_UPDATED_EVENT));
}

async function buildCartFromCookie() {
  const storedItems = readStoredCartItems();
  const slugs = storedItems.map((item) => item.slug);
  const resolved = await Promise.allSettled(slugs.map((slug) => loadCatalogProductBySlug(slug)));

  const productMap = new Map<string, Product>();
  for (const entry of resolved) {
    if (entry.status !== "fulfilled") continue;
    productMap.set(entry.value.product.slug, entry.value.product);
  }

  const items: CartView["items"] = storedItems
    .map((item) => {
      const product = productMap.get(item.slug);
      if (!product) return null;
      return {
        id: product.slug,
        slug: product.slug,
        title: product.title,
        article: product.article,
        image: product.image,
        qty: item.quantity,
        totalPrice: product.price * item.quantity,
        kind: "product" as const,
        brandLabel: product.brandLabel,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

  const cart: CartView = {
    id: "session-cart",
    items,
    subtotal,
    discountTotal: 0,
    total: subtotal,
  };

  // Drop missing products from storage.
  if (items.length !== storedItems.length) {
    writeStoredCartItems(items.map((item) => ({ slug: item.slug, quantity: item.qty })));
  }

  return cart;
}

export async function loadSessionCart() {
  return buildCartFromCookie();
}

export async function addProductToSessionCartBySlug(slug: string) {
  const items = readStoredCartItems();
  const nextItems = [...items];
  const existing = nextItems.find((item) => item.slug === slug);

  if (existing) {
    existing.quantity += 1;
    writeStoredCartItems(nextItems);
    return buildCartFromCookie();
  } else {
    nextItems.push({ slug, quantity: 1 });
  }

  writeStoredCartItems(nextItems);
  return buildCartFromCookie();
}

export async function addProductToSessionCart(product: Product) {
  const items = readStoredCartItems();
  const nextItems = [...items];
  const existing = nextItems.find((item) => item.slug === product.slug);

  if (existing) {
    existing.quantity += 1;
  } else {
    nextItems.push({ slug: product.slug, quantity: 1 });
  }

  writeStoredCartItems(nextItems);
  return buildCartFromCookie();
}

export async function updateSessionCartItem(itemId: string, quantity: number) {
  const items = readStoredCartItems();
  const nextItems =
    quantity <= 0
      ? items.filter((item) => item.slug !== itemId)
      : items.map((item) => (item.slug === itemId ? { ...item, quantity } : item));

  writeStoredCartItems(nextItems);
  return buildCartFromCookie();
}

export async function removeSessionCartItem(itemId: string) {
  const items = readStoredCartItems().filter((item) => item.slug !== itemId);
  writeStoredCartItems(items);
  return buildCartFromCookie();
}

export function clearSessionCart() {
  clearCookie(CART_COOKIE_KEY);
  notifySessionCartUpdated();
}

export async function resolveSessionCartOrderItems(cart: CartView) {
  const productIds = await resolveProductIdsBySlugs(cart.items.map((item) => item.slug));

  return cart.items
    .map((item) => {
      const productId = productIds.get(item.slug);

      if (!productId) {
        return null;
      }

      return {
        productId,
        quantity: item.qty,
      };
    })
    .filter((item): item is { productId: string; quantity: number } => Boolean(item));
}
